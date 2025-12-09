import { supabaseAdmin } from '../db/supabase';
import { invalidateDashboardOnBillChange } from './cache-invalidation.service';

export class BillsService {
  static async getAllBills(userId: string, filters?: any) {
    let query = supabaseAdmin
      .from('bills')
      .select('*')
      .order('bill_date', { ascending: false })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.startDate) {
      query = query.gte('bill_date', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('bill_date', filters.endDate);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data: bills, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch bills: ${error.message}`);
    }

    // Fetch related card and user data separately if needed
    if (bills && bills.length > 0) {
      const cardIds = bills.map(b => b.linked_card_id).filter(Boolean);
      const userIds = bills.map(b => b.uploaded_by).filter(Boolean);

      // Fetch cards data
      let cardsMap: any = {};
      if (cardIds.length > 0) {
        const { data: cards } = await supabaseAdmin
          .from('cards')
          .select('id, card_number, holder_name')
          .in('id', cardIds);
        if (cards) {
          cardsMap = cards.reduce((acc: any, card: any) => {
            acc[card.id] = card;
            return acc;
          }, {});
        }
      }

      // Fetch users data
      let usersMap: any = {};
      if (userIds.length > 0) {
        const { data: users } = await supabaseAdmin
          .from('users')
          .select('id, email')
          .in('id', userIds);
        if (users) {
          usersMap = users.reduce((acc: any, user: any) => {
            acc[user.id] = user;
            return acc;
          }, {});
        }
      }

      // Attach related data to bills
      return bills.map(bill => ({
        ...bill,
        cards: bill.linked_card_id ? cardsMap[bill.linked_card_id] : null,
        users: bill.uploaded_by ? usersMap[bill.uploaded_by] : null
      }));
    }

    return bills;
  }

  static async getBillById(id: string) {
    const { data: bill, error } = await supabaseAdmin
      .from('bills')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw new Error(`Bill not found: ${error.message}`);
    }

    // Fetch related card data if exists
    if (bill.linked_card_id) {
      const { data: card } = await supabaseAdmin
        .from('cards')
        .select('id, card_number, holder_name')
        .eq('id', bill.linked_card_id)
        .single();
      bill.cards = card;
    }

    // Fetch related user data if exists
    if (bill.uploaded_by) {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .eq('id', bill.uploaded_by)
        .single();
      bill.users = user;
    }
    
    return bill;
  }

  static async createBill(data: any, userId: string) {
    // Handle both camelCase (frontend) and snake_case (validator) formats
    const billData = {
      bill_date: data.billDate || data.bill_date || new Date().toISOString().split('T')[0],
      vendor: data.vendor || data.vendor_name,
      amount: data.amount,
      description: data.description || '',
      expense_type: data.expenseType || data.expense_type || 'other',
      linked_card_id: data.cardId || data.card_id || data.linked_card_id || null,
      status: data.status || 'pending',
      uploaded_by: userId,
    };

    // Validate required fields
    if (!billData.vendor) {
      throw new Error('Vendor name is required');
    }
    if (!billData.amount || billData.amount <= 0) {
      throw new Error('Valid amount is required');
    }

    const { data: newBill, error } = await supabaseAdmin
      .from('bills')
      .insert(billData)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create bill: ${error.message}`);
    }
    
    // If linked to a card, update card balance using RPC function
    const cardId = data.cardId || data.card_id || data.linked_card_id;
    if (cardId) {
      const { error: rpcError } = await supabaseAdmin.rpc('increment_card_balance', {
        card_id_param: cardId,
        amount_param: data.amount
      });

      if (rpcError) {
        console.error('Failed to update card balance:', rpcError);
      }
    }
    
    // Invalidate dashboard cache
    await invalidateDashboardOnBillChange(userId);
    
    return newBill;
  }

  static async updateBill(id: string, data: any, userId?: string) {
    // Get current bill to handle card balance changes
    const currentBill = await this.getBillById(id);
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Handle both camelCase and snake_case formats
    if (data.billDate !== undefined || data.bill_date !== undefined) {
      updateData.bill_date = data.billDate || data.bill_date;
    }
    if (data.vendor !== undefined || data.vendor_name !== undefined) {
      updateData.vendor = data.vendor || data.vendor_name;
    }
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.expenseType !== undefined || data.expense_type !== undefined) {
      updateData.expense_type = data.expenseType !== undefined ? data.expenseType : data.expense_type;
    }
    if (data.cardId !== undefined || data.card_id !== undefined || data.linked_card_id !== undefined) {
      updateData.linked_card_id = data.cardId !== undefined ? data.cardId : (data.card_id !== undefined ? data.card_id : data.linked_card_id);
    }

    const { data: updatedBill, error } = await supabaseAdmin
      .from('bills')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update bill: ${error.message}`);
    }

    // Handle card balance updates
    const newCardId = data.cardId !== undefined ? data.cardId : (data.card_id !== undefined ? data.card_id : (data.linked_card_id !== undefined ? data.linked_card_id : undefined));
    
    if (data.amount !== undefined || newCardId !== undefined) {
      // Remove old amount from old card
      if (currentBill.linked_card_id) {
        await supabaseAdmin.rpc('decrement_card_balance', {
          card_id: currentBill.linked_card_id,
          amount: currentBill.amount
        });
      }
      
      // Add new amount to new card
      const finalCardId = newCardId !== undefined ? newCardId : currentBill.linked_card_id;
      const finalAmount = data.amount !== undefined ? data.amount : currentBill.amount;
      
      if (finalCardId) {
        await supabaseAdmin.rpc('increment_card_balance', {
          card_id: finalCardId,
          amount: finalAmount
        });
      }
    }
    
    // Invalidate dashboard cache
    if (userId) {
      await invalidateDashboardOnBillChange(userId);
    }
    
    return updatedBill;
  }

  static async deleteBill(id: string, userId?: string) {
    // Get bill details for card balance adjustment
    const bill = await this.getBillById(id);
    
    // Remove amount from card balance if applicable
    if (bill.linked_card_id) {
      await supabaseAdmin.rpc('decrement_card_balance', {
        card_id: bill.linked_card_id,
        amount: bill.amount
      });
    }
    
    const { error } = await supabaseAdmin
      .from('bills')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete bill: ${error.message}`);
    }

    // Invalidate dashboard cache
    if (userId) {
      await invalidateDashboardOnBillChange(userId);
    }

    return { success: true, message: 'Bill deleted successfully' };
  }

  static async getBillStats(userId: string, startDate?: string, endDate?: string) {
    let query = supabaseAdmin
      .from('bills')
      .select('amount, status');
    
    if (startDate) {
      query = query.gte('bill_date', startDate);
    }
    
    if (endDate) {
      query = query.lte('bill_date', endDate);
    }

    const { data: bills, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch bill stats: ${error.message}`);
    }

    // Calculate stats from the data
    const stats = {
      total_bills: bills.length,
      total_amount: bills.reduce((sum, bill) => sum + Number(bill.amount), 0),
      average_amount: bills.length > 0 
        ? bills.reduce((sum, bill) => sum + Number(bill.amount), 0) / bills.length 
        : 0,
      pending_count: bills.filter(bill => bill.status === 'pending').length,
      approved_count: bills.filter(bill => bill.status === 'approved').length,
      rejected_count: bills.filter(bill => bill.status === 'rejected').length,
    };
    
    return stats;
  }
}
