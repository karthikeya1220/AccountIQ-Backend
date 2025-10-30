import { supabaseAdmin } from '../db/supabase';

export class BillsService {
  static async getAllBills(userId: string, filters?: any) {
    let query = supabaseAdmin
      .from('bills')
      .select(`
        *,
        cards (card_number, card_holder),
        users!bills_created_by_fkey (email)
      `)
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

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch bills: ${error.message}`);
    }

    return data;
  }

  static async getBillById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('bills')
      .select(`
        *,
        cards (card_number, card_holder),
        users!bills_created_by_fkey (email)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      throw new Error(`Bill not found: ${error.message}`);
    }
    
    return data;
  }

  static async createBill(data: any, userId: string) {
    const billData = {
      bill_date: data.billDate || new Date().toISOString().split('T')[0],
      vendor: data.vendor,
      amount: data.amount,
      description: data.description || '',
      category_id: data.categoryId || null,
      card_id: data.cardId || null,
      status: data.status || 'pending',
      created_by: userId,
    };

    const { data: newBill, error } = await supabaseAdmin
      .from('bills')
      .insert(billData)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create bill: ${error.message}`);
    }
    
    // If linked to a card, update card balance using RPC function
    if (data.cardId) {
      const { error: rpcError } = await supabaseAdmin.rpc('increment_card_balance', {
        card_id_param: data.cardId,
        amount_param: data.amount
      });

      if (rpcError) {
        console.error('Failed to update card balance:', rpcError);
      }
    }
    
    return newBill;
  }

  static async updateBill(id: string, data: any, userId?: string) {
    // Get current bill to handle card balance changes
    const currentBill = await this.getBillById(id);
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (data.billDate !== undefined) updateData.bill_date = data.billDate;
    if (data.vendor !== undefined) updateData.vendor = data.vendor;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.cardId !== undefined) updateData.card_id = data.cardId;

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
    if (data.amount !== undefined || data.cardId !== undefined) {
      // Remove old amount from old card
      if (currentBill.card_id) {
        await supabaseAdmin.rpc('decrement_card_balance', {
          card_id: currentBill.card_id,
          amount: currentBill.amount
        });
      }
      
      // Add new amount to new card
      const newCardId = data.cardId !== undefined ? data.cardId : currentBill.card_id;
      const newAmount = data.amount !== undefined ? data.amount : currentBill.amount;
      
      if (newCardId) {
        await supabaseAdmin.rpc('increment_card_balance', {
          card_id: newCardId,
          amount: newAmount
        });
      }
    }
    
    return updatedBill;
  }

  static async deleteBill(id: string) {
    // Get bill details for card balance adjustment
    const bill = await this.getBillById(id);
    
    // Remove amount from card balance if applicable
    if (bill.card_id) {
      await supabaseAdmin.rpc('decrement_card_balance', {
        card_id: bill.card_id,
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
