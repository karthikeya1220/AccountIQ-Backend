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
    expenseData: any,
    userId: string
  ): Promise<PettyExpense> {
    // Map frontend fields to database fields
    const dbExpenseData: any = {
      created_by: userId,
    };

    // Handle description
    if (expenseData.description) {
      dbExpenseData.description = expenseData.description;
    }

    // Handle amount
    if (expenseData.amount !== undefined) {
      dbExpenseData.amount = expenseData.amount;
    }

    // Handle expense_date
    if (expenseData.expense_date) {
      dbExpenseData.expense_date = expenseData.expense_date;
    }

    // Handle category field - frontend might send 'category' (string) but DB expects 'category_id' (UUID)
    // For now, we'll store the category as a string description in a notes field if it's not a UUID
    if (expenseData.category) {
      // Check if it's a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(expenseData.category)) {
        dbExpenseData.category_id = expenseData.category;
      }
      // If it's a string category name, we'll ignore it since DB only has category_id (UUID)
      // The category string will be in the description
    } else if (expenseData.category_id) {
      dbExpenseData.category_id = expenseData.category_id;
    }

    // Note: is_approved is not in the database schema (migrations.ts), so we skip it
    // If you need approval functionality, you'll need to add this column to the database first

    const { data, error } = await supabaseAdmin
      .from('petty_expenses')
      .insert([dbExpenseData])
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
