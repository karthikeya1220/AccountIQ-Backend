import { supabaseAdmin } from '../db/supabase';
import {
  DashboardKPIs,
  MonthlyTrendPoint,
  ExpenseByCategoryPoint,
  RecentTransaction,
  DashboardAlerts,
  BudgetAlert,
  CardSummary,
  BudgetStatus,
  DashboardSummaryResponse,
  DashboardPeriod,
  UserRole,
} from '../types';

const CACHE_TTL = 5 * 60; // 5 minutes

class DashboardService {
  /**
   * Get complete dashboard summary with all data
   */
  async getDashboardSummary(
    userId: string,
    userRole: UserRole,
    params?: {
      period?: 'current_month' | 'last_30_days' | 'custom_range';
      startDate?: string;
      endDate?: string;
      include?: string[];
      exclude?: string[];
      timeZone?: string;
    }
  ): Promise<DashboardSummaryResponse> {
    try {
      // Calculate date range
      const { startDate, endDate, label } = this.calculateDateRange(params?.period);

      // Fetch all data in parallel
      const [kpis, monthlyTrend, expensesByCategory, recentTransactions, alerts, cards, budgetStatus] =
        await Promise.all([
          this.getKPIs(userId, userRole, startDate, endDate),
          this.getMonthlyTrend(userId, userRole),
          this.getExpensesByCategory(userId, userRole, startDate, endDate),
          this.getRecentTransactions(userId, userRole, 10),
          this.getAlerts(userId, userRole, startDate, endDate),
          this.getCardSummary(userId, userRole),
          this.getBudgetStatus(userId, userRole),
        ]);

      const now = new Date();
      const cacheUntil = new Date(now.getTime() + CACHE_TTL * 1000);

      const response: DashboardSummaryResponse = {
        success: true,
        data: {
          timestamp: now.toISOString(),
          period: {
            startDate,
            endDate,
            label,
          },
          kpis,
          monthlyTrend,
          expensesByCategory,
          recentTransactions,
          alerts,
          cards,
          budgetStatus,
          metadata: {
            dataFreshness: 'real-time',
            cacheUntil: cacheUntil.toISOString(),
            cacheDuration: CACHE_TTL,
            permissions: {
              canEdit: userRole === UserRole.ADMIN,
              canExport: true,
              canDelete: userRole === UserRole.ADMIN,
            },
            userRole,
          },
        },
        pagination: null,
      };

      return response;
    } catch (error) {
      console.error('Error fetching dashboard summary:', { userId, error });
      throw error;
    }
  }

  /**
   * Get KPI metrics for dashboard
   */
  private async getKPIs(
    userId: string,
    userRole: UserRole,
    startDate: string,
    endDate: string
  ): Promise<DashboardKPIs> {
    try {
      // Get total expenses
      const { data: expenseData } = await supabaseAdmin
        .from('cash_transactions')
        .select('amount')
        .eq('transaction_type', 'expense')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      const totalExpenses = expenseData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      // Get total income
      const { data: incomeData } = await supabaseAdmin
        .from('cash_transactions')
        .select('amount')
        .eq('transaction_type', 'income')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      const totalIncome = incomeData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      // Get active cards count
      const { count: cardsInUse } = await supabaseAdmin
        .from('cards')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get card balances
      const { data: cardData } = await supabaseAdmin
        .from('cards')
        .select('limit');

      const cardBalances = cardData?.reduce((sum, c) => sum + (c.limit || 0), 0) || 0;

      // Get pending bills count
      const { count: pendingBills } = await supabaseAdmin
        .from('bills')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get cash balance (latest entry)
      const { data: cashData } = await supabaseAdmin
        .from('cash_balance')
        .select('amount')
        .order('created_at', { ascending: false })
        .limit(1);

      const cashOnHand = cashData?.[0]?.amount || 0;

      // Get active employees count
      const { count: activeEmployees } = await supabaseAdmin
        .from('employees')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get average budget utilization
      const { data: budgetData } = await supabaseAdmin
        .from('budgets')
        .select('amount, spent')
        .eq('is_active', true);

      const budgetUtilization =
        budgetData && budgetData.length > 0
          ? Math.round(
              (budgetData.reduce((sum, b) => {
                if (b.amount > 0) {
                  return sum + (b.spent || 0) / b.amount;
                }
                return sum;
              }, 0) /
                budgetData.length) *
                10000
            ) / 100
          : 0;

      // Get total payroll
      const totalPayroll = await this.getTotalPayroll(startDate, endDate);

      return {
        totalExpenses,
        totalIncome,
        availableBalance: totalIncome - totalExpenses,
        budgetUtilization,
        cardsInUse: cardsInUse || 0,
        pendingBills: pendingBills || 0,
        cardBalances,
        cashOnHand,
        totalPayroll,
        activeEmployees: activeEmployees || 0,
      };
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      throw error;
    }
  }

  /**
   * Get monthly trend data (last 6 months)
   */
  private async getMonthlyTrend(userId: string, userRole: UserRole): Promise<MonthlyTrendPoint[]> {
    try {
      const months = 6;
      const trendData: MonthlyTrendPoint[] = [];

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStr = date.toISOString().slice(0, 7);
        const monthStart = `${monthStr}-01`;
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

        // Get expenses for month
        const { data: expenseData } = await supabaseAdmin
          .from('cash_transactions')
          .select('amount')
          .eq('transaction_type', 'expense')
          .gte('transaction_date', monthStart)
          .lte('transaction_date', monthEnd);

        const expenses = expenseData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

        // Get income for month
        const { data: incomeData } = await supabaseAdmin
          .from('cash_transactions')
          .select('amount')
          .eq('transaction_type', 'income')
          .gte('transaction_date', monthStart)
          .lte('transaction_date', monthEnd);

        const income = incomeData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

        // Get budget for month
        const { data: budgetData } = await supabaseAdmin
          .from('budgets')
          .select('amount')
          .eq('is_active', true)
          .gte('start_date', monthStart)
          .lte('end_date', monthEnd);

        const budget = budgetData?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0;

        trendData.push({
          month: monthStr,
          expenses,
          budget,
          income,
        });
      }

      return trendData;
    } catch (error) {
      console.error('Error fetching monthly trend:', error);
      throw error;
    }
  }

  /**
   * Get expense breakdown by category
   */
  private async getExpensesByCategory(
    userId: string,
    userRole: UserRole,
    startDate: string,
    endDate: string
  ): Promise<ExpenseByCategoryPoint[]> {
    try {
      const { data: transactionData } = await supabaseAdmin
        .from('cash_transactions')
        .select('amount, category')
        .eq('transaction_type', 'expense')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate);

      if (!transactionData || transactionData.length === 0) {
        return [];
      }

      // Group by category
      const categoryMap: Record<string, number> = {};
      transactionData.forEach((t) => {
        const category = t.category || 'Uncategorized';
        categoryMap[category] = (categoryMap[category] || 0) + (t.amount || 0);
      });

      // Calculate total
      const total = Object.values(categoryMap).reduce((sum, a) => sum + a, 0);

      // Convert to array and sort by amount
      const result = Object.entries(categoryMap)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: total > 0 ? Math.round((amount / total) * 1000) / 10 : 0,
          trend: 'stable' as const,
        }))
        .sort((a, b) => b.amount - a.amount);

      return result;
    } catch (error) {
      console.error('Error fetching expenses by category:', error);
      throw error;
    }
  }

  /**
   * Get recent transactions
   */
  private async getRecentTransactions(
    userId: string,
    userRole: UserRole,
    limit: number = 10
  ): Promise<RecentTransaction[]> {
    try {
      const { data: transactionData } = await supabaseAdmin
        .from('cash_transactions')
        .select('id, description, amount, transaction_date, category, transaction_type, created_by')
        .order('transaction_date', { ascending: false })
        .limit(limit);

      if (!transactionData) {
        return [];
      }

      // Fetch user info for created_by field
      const userIds = [...new Set(transactionData.map((t) => t.created_by).filter(Boolean))];
      let userMap: Record<string, string> = {};

      if (userIds.length > 0) {
        const { data: userData } = await supabaseAdmin
          .from('users')
          .select('id, first_name, last_name')
          .in('id', userIds);

        if (userData) {
          userMap = Object.fromEntries(
            userData.map((u) => [u.id, `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'System'])
          );
        }
      }

      return transactionData.map((t) => ({
        id: t.id,
        description: t.description,
        amount: t.amount || 0,
        date: new Date(t.transaction_date),
        status: 'approved' as const,
        category: t.category || 'Other',
        type: t.transaction_type as 'expense' | 'income',
        createdBy: userMap[t.created_by] || 'System',
      }));
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  }

  /**
   * Get budget and other alerts
   */
  private async getAlerts(
    userId: string,
    userRole: UserRole,
    startDate: string,
    endDate: string
  ): Promise<DashboardAlerts> {
    try {
      // Get budget alerts
      const { data: budgetData } = await supabaseAdmin
        .from('budgets')
        .select('id, category_name, amount, spent')
        .eq('is_active', true);

      const budgetAlerts: BudgetAlert[] =
        budgetData
          ?.filter((b) => b.amount > 0)
          .map((b) => {
            const percentage = Math.round((b.spent || 0) / b.amount * 100);
            let severity: 'low' | 'medium' | 'high' = 'low';
            if (percentage >= 100) {
              severity = 'high';
            } else if (percentage >= 80) {
              severity = 'medium';
            }
            return {
              id: b.id,
              category: b.category_name,
              current: b.spent || 0,
              limit: b.amount,
              percentage,
              severity,
              message: `${b.category_name} budget at ${percentage}% utilization`,
            };
          })
          .filter((alert) => alert.percentage >= 80) || [];

      // Get pending approvals (bills with pending status)
      const { count: pendingApprovals } = await supabaseAdmin
        .from('bills')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get overdue bills
      const { count: overdueBills } = await supabaseAdmin
        .from('bills')
        .select('id', { count: 'exact', head: true })
        .neq('status', 'paid')
        .lt('bill_date', new Date().toISOString().split('T')[0]);

      // Get cash balance
      const { data: cashData } = await supabaseAdmin
        .from('cash_balance')
        .select('amount')
        .order('created_at', { ascending: false })
        .limit(1);

      const cashOnHand = cashData?.[0]?.amount || 0;
      const lowCashBalance = cashOnHand < 10000; // Threshold

      return {
        budgetAlerts,
        pendingApprovals: pendingApprovals || 0,
        overdueBills: overdueBills || 0,
        lowCashBalance,
      };
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  }

  /**
   * Get card summary
   */
  private async getCardSummary(userId: string, userRole: UserRole): Promise<CardSummary> {
    try {
      const { data: cardData, count: totalCards } = await supabaseAdmin
        .from('cards')
        .select('is_active, limit, balance', { count: 'exact' });

      if (!cardData) {
        return {
          totalCards: 0,
          activeCards: 0,
          totalLimit: 0,
          totalUsed: 0,
          available: 0,
        };
      }

      const activeCards = cardData.filter((c) => c.is_active).length;
      const totalLimit = cardData.reduce((sum, c) => sum + (c.limit || 0), 0);
      const totalUsed = totalLimit - cardData.reduce((sum, c) => sum + (c.balance || 0), 0);

      return {
        totalCards: totalCards || 0,
        activeCards,
        totalLimit,
        totalUsed: Math.max(0, totalUsed),
        available: Math.max(0, totalLimit - totalUsed),
      };
    } catch (error) {
      console.error('Error fetching card summary:', error);
      throw error;
    }
  }

  /**
   * Get budget status summary
   */
  private async getBudgetStatus(userId: string, userRole: UserRole): Promise<BudgetStatus> {
    try {
      const { data: budgetData, count: total } = await supabaseAdmin
        .from('budgets')
        .select('spent, amount', { count: 'exact' })
        .eq('is_active', true)
        .gte('end_date', new Date().toISOString().split('T')[0]);

      if (!budgetData) {
        return {
          onTrack: 0,
          warning: 0,
          exceeded: 0,
          total: 0,
        };
      }

      const onTrack = budgetData.filter((b) => b.amount > 0 && (b.spent || 0) / b.amount < 0.8).length;
      const warning = budgetData.filter(
        (b) => b.amount > 0 && (b.spent || 0) / b.amount >= 0.8 && (b.spent || 0) / b.amount < 1.0
      ).length;
      const exceeded = budgetData.filter((b) => b.amount > 0 && (b.spent || 0) / b.amount >= 1.0).length;

      return {
        onTrack,
        warning,
        exceeded,
        total: total || 0,
      };
    } catch (error) {
      console.error('Error fetching budget status:', error);
      throw error;
    }
  }

  /**
   * Helper: Get total payroll
   */
  private async getTotalPayroll(startDate: string, endDate: string): Promise<number> {
    try {
      const { data: salaryData } = await supabaseAdmin
        .from('salary')
        .select('net_salary')
        .eq('status', 'paid')
        .gte('paid_date', startDate)
        .lte('paid_date', endDate);

      return salaryData?.reduce((sum, s) => sum + (s.net_salary || 0), 0) || 0;
    } catch (error) {
      console.error('Error fetching total payroll:', error);
      return 0;
    }
  }

  /**
   * Calculate date range based on period
   */
  private calculateDateRange(
    period?: 'current_month' | 'last_30_days' | 'custom_range'
  ): { startDate: string; endDate: string; label: string } {
    const now = new Date();
    let startDate: Date;
    let label: string;

    switch (period) {
      case 'current_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        label = 'Current Month';
        break;
      case 'last_30_days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        label = 'Last 30 Days';
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        label = 'Last 30 Days';
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
      label,
    };
  }

  /**
   * Invalidate cache when data changes (placeholder for future Redis integration)
   */
  async invalidateDashboardCache(userId?: string): Promise<void> {
    try {
      console.log('Dashboard cache invalidated', { userId });
      // Future: Implement Redis cache invalidation here
    } catch (error) {
      console.warn('Cache invalidation warning:', error);
    }
  }
}

export const dashboardService = new DashboardService();
