import { supabaseAdmin } from '../db/supabase';

export interface Budget {
  id: string;
  category_id?: string;
  category_name?: string;
  budget_limit: number;
  spent: number;
  period: string;
  month?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBudgetInput {
  category_id?: string;
  category_name?: string;
  budget_limit: number;
  period: string;
  month?: string;
}

export interface UpdateBudgetInput {
  category_id?: string;
  category_name?: string;
  budget_limit?: number;
  spent?: number;
  period?: string;
  month?: string;
  is_active?: boolean;
}

export class BudgetsService {
  // Get all budgets with optional filters
  async getAllBudgets(filters: {
    period?: string;
    month?: string;
    isActive?: boolean;
  } = {}): Promise<Budget[]> {
    let query = supabaseAdmin
      .from('budgets')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.period) {
      query = query.eq('period', filters.period);
    }
    if (filters.month) {
      query = query.eq('month', filters.month);
    }
    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch budgets: ${error.message}`);
    }

    return data || [];
  }

  // Get budget by ID
  async getBudgetById(id: string): Promise<Budget> {
    const { data, error } = await supabaseAdmin
      .from('budgets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch budget: ${error.message}`);
    }

    if (!data) {
      throw new Error('Budget not found');
    }

    return data;
  }

  // Create new budget
  async createBudget(budgetData: any): Promise<Budget> {
    // Map frontend fields to database fields
    const dbBudgetData: any = {
      spent: 0,
      is_active: true,
    };

    // Handle category field (can be 'category' or 'category_name')
    if (budgetData.category) {
      dbBudgetData.category_name = budgetData.category;
    } else if (budgetData.category_name) {
      dbBudgetData.category_name = budgetData.category_name;
    }

    // Handle budget_limit field (can be 'amount' or 'budget_limit')
    if (budgetData.amount !== undefined) {
      dbBudgetData.budget_limit = budgetData.amount;
    } else if (budgetData.budget_limit !== undefined) {
      dbBudgetData.budget_limit = budgetData.budget_limit;
    }

    // Handle period
    if (budgetData.period) {
      dbBudgetData.period = budgetData.period;
    }

    // Handle month field (can be 'start_date' or 'month')
    if (budgetData.start_date) {
      dbBudgetData.month = budgetData.start_date;
    } else if (budgetData.month) {
      dbBudgetData.month = budgetData.month;
    }

    // Handle category_id if provided
    if (budgetData.category_id) {
      dbBudgetData.category_id = budgetData.category_id;
    }

    const { data, error } = await supabaseAdmin
      .from('budgets')
      .insert([dbBudgetData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create budget: ${error.message}`);
    }

    return data;
  }

  // Update budget
  async updateBudget(id: string, budgetData: UpdateBudgetInput): Promise<Budget> {
    const { data, error } = await supabaseAdmin
      .from('budgets')
      .update({
        ...budgetData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update budget: ${error.message}`);
    }

    if (!data) {
      throw new Error('Budget not found');
    }

    return data;
  }

  // Delete budget
  async deleteBudget(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('budgets')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete budget: ${error.message}`);
    }
  }

  // Get budget alerts (budgets that are at or over limit)
  async getBudgetAlerts(threshold: number = 0.8): Promise<Budget[]> {
    const { data, error } = await supabaseAdmin
      .from('budgets')
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to fetch budget alerts: ${error.message}`);
    }

    // Filter budgets where spent >= (budget_limit * threshold)
    const alerts = (data || []).filter((budget) => {
      const spentAmount = Number(budget.spent);
      const limitAmount = Number(budget.budget_limit);
      return spentAmount >= limitAmount * threshold;
    });

    return alerts;
  }

  // Update budget spent amount
  async updateSpentAmount(id: string, amount: number): Promise<Budget> {
    const budget = await this.getBudgetById(id);
    const newSpent = Number(budget.spent) + amount;

    return this.updateBudget(id, { spent: newSpent });
  }
}
