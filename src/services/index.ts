/**
 * Backend service implementations
 */
import { getSupabaseClient } from '../db/db';
import bcrypt from 'bcrypt';
export { dashboardService } from './dashboard.service';
export {
  invalidateDashboardOnBillChange,
  invalidateDashboardOnExpenseChange,
  invalidateDashboardOnBudgetChange,
  invalidateDashboardOnCardChange,
  invalidateDashboardOnSalaryChange,
  invalidateDashboardCache,
} from './cache-invalidation.service';

const supabase = getSupabaseClient();

// ============= Auth Service =============
export class AuthService {
  static async signup(email: string, password: string, name: string) {
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Failed to create user');
      }

      // Create user profile
      const { data: userData, error: userError } = await supabase.from('users').insert([
        {
          id: authData.user.id,
          email,
          name: name || email.split('@')[0],
          role: 'user',
        },
      ]).select().single();

      if (userError) {
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error('Failed to create user profile');
      }

      return { user: userData, authUser: authData.user };
    } catch (error) {
      throw error;
    }
  }

  static async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      throw new Error(error?.message || 'Invalid credentials');
    }

    // Get user profile
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      user: userData,
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresIn: data.session.expires_in,
      },
    };
  }

  static async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
}

// ============= Bills Service =============
export class BillService {
  static async createBill(billData: any, userId: string) {
    const { data, error } = await supabase
      .from('bills')
      .insert([
        {
          ...billData,
          created_by: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getBills(userId: string, filters?: any) {
    let query = supabase
      .from('bills')
      .select('*')
      .eq('created_by', userId);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.startDate) {
      query = query.gte('bill_date', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('bill_date', filters.endDate);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query.order('bill_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getBillById(id: string, userId: string) {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('id', id)
      .eq('created_by', userId)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateBill(id: string, billData: any, userId: string) {
    const { data, error } = await supabase
      .from('bills')
      .update({
        ...billData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('created_by', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteBill(id: string, userId: string) {
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', id)
      .eq('created_by', userId);

    if (error) throw error;
  }

  static async getBillStats(userId: string) {
    const { data, error } = await supabase
      .from('bills')
      .select('amount, status')
      .eq('created_by', userId);

    if (error) throw error;

    const stats = {
      total: data?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0,
      pending: data?.filter(b => b.status === 'pending').reduce((sum, b) => sum + (b.amount || 0), 0) || 0,
      approved: data?.filter(b => b.status === 'approved').reduce((sum, b) => sum + (b.amount || 0), 0) || 0,
      rejected: data?.filter(b => b.status === 'rejected').reduce((sum, b) => sum + (b.amount || 0), 0) || 0,
      count: data?.length || 0,
    };

    return stats;
  }
}

// ============= Cards Service =============
export class CardService {
  static async createCard(cardData: any, userId: string) {
    const { data, error } = await supabase
      .from('cards')
      .insert([
        {
          ...cardData,
          created_by: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getCards(userId: string) {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('created_by', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getCardById(id: string, userId: string) {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('id', id)
      .eq('created_by', userId)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateCard(id: string, cardData: any, userId: string) {
    const { data, error } = await supabase
      .from('cards')
      .update({
        ...cardData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('created_by', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteCard(id: string, userId: string) {
    const { error } = await supabase
      .from('cards')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('created_by', userId);

    if (error) throw error;
  }

  static async getCardStats(userId: string) {
    const { data, error } = await supabase
      .from('cards')
      .select('balance, credit_limit')
      .eq('created_by', userId)
      .eq('is_active', true);

    if (error) throw error;

    const stats = {
      totalBalance: data?.reduce((sum, c) => sum + (c.balance || 0), 0) || 0,
      totalCreditLimit: data?.reduce((sum, c) => sum + (c.credit_limit || 0), 0) || 0,
      count: data?.length || 0,
    };

    return stats;
  }
}

// ============= Cash Transactions Service =============
export class CashTransactionService {
  static async createTransaction(transactionData: any, userId: string) {
    const { data, error } = await supabase
      .from('cash_transactions')
      .insert([
        {
          ...transactionData,
          created_by: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getTransactions(userId: string, filters?: any) {
    let query = supabase
      .from('cash_transactions')
      .select('*')
      .eq('created_by', userId);

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.startDate) {
      query = query.gte('transaction_date', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('transaction_date', filters.endDate);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query.order('transaction_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getTransactionById(id: string, userId: string) {
    const { data, error } = await supabase
      .from('cash_transactions')
      .select('*')
      .eq('id', id)
      .eq('created_by', userId)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateTransaction(id: string, transactionData: any, userId: string) {
    const { data, error } = await supabase
      .from('cash_transactions')
      .update({
        ...transactionData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('created_by', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteTransaction(id: string, userId: string) {
    const { error } = await supabase
      .from('cash_transactions')
      .delete()
      .eq('id', id)
      .eq('created_by', userId);

    if (error) throw error;
  }

  static async getTransactionStats(userId: string) {
    const { data, error } = await supabase
      .from('cash_transactions')
      .select('amount, type')
      .eq('created_by', userId);

    if (error) throw error;

    const stats = {
      income: data?.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0) || 0,
      expense: data?.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0) || 0,
      net: (data?.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0) || 0) -
            (data?.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0) || 0),
      count: data?.length || 0,
    };

    return stats;
  }
}

// ============= Salary Service =============
export class SalaryService {
  static async createSalary(salaryData: any, userId: string) {
    const { data, error } = await supabase
      .from('salaries')
      .insert([
        {
          ...salaryData,
          net_salary: (salaryData.base_salary || 0) + (salaryData.allowances || 0) - (salaryData.deductions || 0),
          created_by: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getSalaries(filters?: any) {
    let query = supabase.from('salaries').select('*');

    if (filters?.employeeId) {
      query = query.eq('employee_id', filters.employeeId);
    }

    if (filters?.startDate) {
      query = query.gte('salary_month', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('salary_month', filters.endDate);
    }

    if (filters?.status) {
      query = query.eq('payment_status', filters.status);
    }

    const { data, error } = await query.order('salary_month', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getSalaryById(id: string) {
    const { data, error } = await supabase
      .from('salaries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateSalary(id: string, salaryData: any) {
    const { data, error } = await supabase
      .from('salaries')
      .update({
        ...salaryData,
        net_salary: (salaryData.base_salary || 0) + (salaryData.allowances || 0) - (salaryData.deductions || 0),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteSalary(id: string) {
    const { error } = await supabase
      .from('salaries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getSalaryStats() {
    const { data, error } = await supabase
      .from('salaries')
      .select('net_salary, payment_status');

    if (error) throw error;

    const stats = {
      totalPayroll: data?.reduce((sum, s) => sum + (s.net_salary || 0), 0) || 0,
      paidCount: data?.filter(s => s.payment_status === 'paid').length || 0,
      pendingCount: data?.filter(s => s.payment_status === 'pending').length || 0,
      failedCount: data?.filter(s => s.payment_status === 'failed').length || 0,
      count: data?.length || 0,
    };

    return stats;
  }
}

// ============= Petty Expenses Service =============
export class PettyExpenseService {
  static async createExpense(expenseData: any, userId: string) {
    const { data, error } = await supabase
      .from('petty_expenses')
      .insert([
        {
          ...expenseData,
          created_by: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getExpenses(userId: string, filters?: any) {
    let query = supabase
      .from('petty_expenses')
      .select('*')
      .eq('created_by', userId);

    if (filters?.startDate) {
      query = query.gte('expense_date', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('expense_date', filters.endDate);
    }

    if (filters?.isApproved !== undefined) {
      query = query.eq('is_approved', filters.isApproved);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query.order('expense_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getExpenseById(id: string, userId: string) {
    const { data, error } = await supabase
      .from('petty_expenses')
      .select('*')
      .eq('id', id)
      .eq('created_by', userId)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateExpense(id: string, expenseData: any, userId: string) {
    const { data, error } = await supabase
      .from('petty_expenses')
      .update({
        ...expenseData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('created_by', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteExpense(id: string, userId: string) {
    const { error } = await supabase
      .from('petty_expenses')
      .delete()
      .eq('id', id)
      .eq('created_by', userId);

    if (error) throw error;
  }

  static async getExpenseStats(userId: string) {
    const { data, error } = await supabase
      .from('petty_expenses')
      .select('amount, is_approved')
      .eq('created_by', userId);

    if (error) throw error;

    const stats = {
      totalExpense: data?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0,
      approvedExpense: data?.filter(e => e.is_approved).reduce((sum, e) => sum + (e.amount || 0), 0) || 0,
      pendingExpense: data?.filter(e => !e.is_approved).reduce((sum, e) => sum + (e.amount || 0), 0) || 0,
      count: data?.length || 0,
    };

    return stats;
  }
}

// ============= Budget Service =============
export class BudgetService {
  static async createBudget(budgetData: any, userId: string) {
    const { data, error } = await supabase
      .from('budgets')
      .insert([
        {
          ...budgetData,
          created_by: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getBudgets(filters?: any) {
    let query = supabase
      .from('budgets')
      .select('*')
      .eq('is_active', true);

    if (filters?.period) {
      query = query.eq('period', filters.period);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async getBudgetById(id: string) {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateBudget(id: string, budgetData: any) {
    const { data, error } = await supabase
      .from('budgets')
      .update({
        ...budgetData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteBudget(id: string) {
    const { error } = await supabase
      .from('budgets')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  static async updateBudgetSpent(budgetId: string, spent: number) {
    const { data, error } = await supabase
      .from('budgets')
      .update({
        spent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', budgetId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async checkBudgetAlerts() {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;

    return data?.map(budget => ({
      id: budget.id,
      category: budget.category,
      percentage: (budget.spent / budget.budget_limit) * 100,
      exceeded: budget.spent > budget.budget_limit,
      alert: (budget.spent / budget.budget_limit) >= (budget.alert_threshold || 0.8),
    })) || [];
  }
}

// ============= Reminders Service =============
export class ReminderService {
  static async createReminder(reminderData: any, userId: string) {
    const { data, error } = await supabase
      .from('reminders')
      .insert([
        {
          ...reminderData,
          created_by: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getReminders(userId: string, filters?: any) {
    let query = supabase
      .from('reminders')
      .select('*')
      .eq('created_by', userId);

    if (filters?.startDate) {
      query = query.gte('reminder_date', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte('reminder_date', filters.endDate);
    }

    if (filters?.type) {
      query = query.eq('reminder_type', filters.type);
    }

    const { data, error } = await query.order('reminder_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getReminderById(id: string, userId: string) {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('id', id)
      .eq('created_by', userId)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateReminder(id: string, reminderData: any, userId: string) {
    const { data, error } = await supabase
      .from('reminders')
      .update({
        ...reminderData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('created_by', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteReminder(id: string, userId: string) {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)
      .eq('created_by', userId);

    if (error) throw error;
  }

  static async markReminderAsSent(id: string) {
    const { data, error } = await supabase
      .from('reminders')
      .update({
        is_sent: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUpcomingReminders(days: number = 7) {
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .gte('reminder_date', today.toISOString().split('T')[0])
      .lte('reminder_date', futureDate.toISOString().split('T')[0])
      .eq('is_sent', false);

    if (error) throw error;
    return data || [];
  }
}

// ============= Employees Service =============
export class EmployeeService {
  static async createEmployee(employeeData: any, userId: string) {
    const { data, error } = await supabase
      .from('employees')
      .insert([
        {
          ...employeeData,
          created_by: userId,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getEmployees() {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async getEmployeeById(id: string) {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async updateEmployee(id: string, employeeData: any) {
    const { data, error } = await supabase
      .from('employees')
      .update({
        ...employeeData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteEmployee(id: string) {
    const { error } = await supabase
      .from('employees')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  }

  static async getEmployeeStats() {
    const { data, error } = await supabase
      .from('employees')
      .select('salary_amount, is_active');

    if (error) throw error;

    const stats = {
      total: data?.filter(e => e.is_active).length || 0,
      totalPayroll: data?.filter(e => e.is_active).reduce((sum, e) => sum + (e.salary_amount || 0), 0) || 0,
    };

    return stats;
  }
}
