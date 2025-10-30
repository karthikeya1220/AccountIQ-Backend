import { supabaseAdmin } from '../db/supabase';

export class CashTransactionsService {
  static async getAllTransactions(filters?: any) {
    let query = supabaseAdmin
      .from('cash_transactions')
      .select('*')
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.startDate) {
      query = query.gte('transaction_date', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('transaction_date', filters.endDate);
    }

    if (filters?.type) {
      query = query.eq('transaction_type', filters.type);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch cash transactions: ${error.message}`);
    }

    return data;
  }

  static async getTransactionById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('cash_transactions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw new Error(`Transaction not found: ${error.message}`);
    }
    
    return data;
  }

  static async createTransaction(data: any, userId: string) {
    const transactionData: any = {
      transaction_date: data.date || new Date().toISOString().split('T')[0],
      description: data.description || 'Cash transaction',
      amount: data.amount,
      transaction_type: data.type || 'expense',
      notes: data.notes || null,
      created_by: userId,
    };

    // Add category - use category string if provided, otherwise null
    if (data.category) {
      transactionData.category = data.category;
    }
    
    // Add payment_method if column exists
    if (data.payment_method) {
      transactionData.payment_method = data.payment_method;
    }

    const { data: newTransaction, error } = await supabaseAdmin
      .from('cash_transactions')
      .insert(transactionData)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Failed to create transaction: ${error.message}`);
    }
    
    return newTransaction;
  }

  static async updateTransaction(id: string, data: any) {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (data.date !== undefined) updateData.transaction_date = data.date;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.type !== undefined) updateData.transaction_type = data.type;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.payment_method !== undefined) updateData.payment_method = data.payment_method;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const { data: updatedTransaction, error } = await supabaseAdmin
      .from('cash_transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Supabase update error:', error);
      throw new Error(`Failed to update transaction: ${error.message}`);
    }
    
    return updatedTransaction;
  }

  static async deleteTransaction(id: string) {
    const { error } = await supabaseAdmin
      .from('cash_transactions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete transaction: ${error.message}`);
    }

    return { success: true, message: 'Transaction deleted successfully' };
  }

  static async getTransactionStats(filters?: any) {
    let query = supabaseAdmin
      .from('cash_transactions')
      .select('amount, transaction_type');

    if (filters?.startDate) {
      query = query.gte('transaction_date', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('transaction_date', filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch transaction stats: ${error.message}`);
    }

    const stats = {
      total_income: 0,
      total_expense: 0,
      net_balance: 0,
      transaction_count: data.length,
    };

    data.forEach((transaction: any) => {
      const amount = Number(transaction.amount);
      if (transaction.transaction_type === 'income' || amount > 0) {
        stats.total_income += Math.abs(amount);
      } else {
        stats.total_expense += Math.abs(amount);
      }
    });

    stats.net_balance = stats.total_income - stats.total_expense;

    return stats;
  }
}
