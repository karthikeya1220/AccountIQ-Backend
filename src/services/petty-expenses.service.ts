import { supabaseAdmin } from '../db/supabase';

export interface PettyExpense {
  id: string;
  description: string;
  amount: number;
  category_id?: string;
  expense_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePettyExpenseInput {
  description: string;
  amount: number;
  category_id?: string;
  expense_date: string;
}

export interface UpdatePettyExpenseInput {
  description?: string;
  amount?: number;
  category_id?: string;
  expense_date?: string;
}

export class PettyExpensesService {
  // Get all petty expenses with optional filters
  async getAllExpenses(filters: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    userId?: string;
  } = {}): Promise<PettyExpense[]> {
    let query = supabaseAdmin
      .from('petty_expenses')
      .select('*')
      .order('expense_date', { ascending: false });

    if (filters.startDate) {
      query = query.gte('expense_date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('expense_date', filters.endDate);
    }
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters.userId) {
      query = query.eq('created_by', filters.userId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch petty expenses: ${error.message}`);
    }

    return data || [];
  }

  // Get expense by ID
  async getExpenseById(id: string): Promise<PettyExpense> {
    const { data, error } = await supabaseAdmin
      .from('petty_expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch petty expense: ${error.message}`);
    }

    if (!data) {
      throw new Error('Petty expense not found');
    }

    return data;
  }

  // Create new expense
  async createExpense(
    expenseData: CreatePettyExpenseInput,
    userId: string
  ): Promise<PettyExpense> {
    const { data, error } = await supabaseAdmin
      .from('petty_expenses')
      .insert([
        {
          ...expenseData,
          created_by: userId,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create petty expense: ${error.message}`);
    }

    return data;
  }

  // Update expense
  async updateExpense(
    id: string,
    expenseData: UpdatePettyExpenseInput
  ): Promise<PettyExpense> {
    const { data, error } = await supabaseAdmin
      .from('petty_expenses')
      .update({
        ...expenseData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update petty expense: ${error.message}`);
    }

    if (!data) {
      throw new Error('Petty expense not found');
    }

    return data;
  }

  // Delete expense
  async deleteExpense(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('petty_expenses')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete petty expense: ${error.message}`);
    }
  }

  // Get monthly summary
  async getMonthlySummary(month: string, year: string): Promise<{
    total: number;
    count: number;
    byCategory: Array<{ category_id: string; total: number; count: number }>;
  }> {
    const startDate = `${year}-${month.padStart(2, '0')}-01`;
    const endDate = `${year}-${month.padStart(2, '0')}-31`;

    const { data, error } = await supabaseAdmin
      .from('petty_expenses')
      .select('*')
      .gte('expense_date', startDate)
      .lte('expense_date', endDate);

    if (error) {
      throw new Error(`Failed to fetch monthly summary: ${error.message}`);
    }

    const expenses = data || [];
    const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const count = expenses.length;

    // Group by category
    const categoryMap = new Map<string, { total: number; count: number }>();
    expenses.forEach((expense) => {
      const categoryId = expense.category_id || 'uncategorized';
      const existing = categoryMap.get(categoryId) || { total: 0, count: 0 };
      categoryMap.set(categoryId, {
        total: existing.total + Number(expense.amount),
        count: existing.count + 1,
      });
    });

    const byCategory = Array.from(categoryMap.entries()).map(([category_id, stats]) => ({
      category_id,
      ...stats,
    }));

    return { total, count, byCategory };
  }
}
