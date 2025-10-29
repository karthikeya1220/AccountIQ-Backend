import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import {
  BillService,
  CardService,
  CashTransactionService,
  SalaryService,
  PettyExpenseService,
  BudgetService,
  EmployeeService,
} from '../services';

const router = Router();

// Get dashboard data (KPIs and summaries)
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const [billStats, cardStats, cashStats, salaryStats, pettyStats, budgetAlerts, employees] = await Promise.all([
      BillService.getBillStats(userId),
      CardService.getCardStats(userId),
      CashTransactionService.getTransactionStats(userId),
      SalaryService.getSalaryStats(),
      PettyExpenseService.getExpenseStats(userId),
      BudgetService.checkBudgetAlerts(),
      EmployeeService.getEmployeeStats(),
    ]);

    res.json({
      success: true,
      data: {
        bills: billStats,
        cards: cardStats,
        cashTransactions: cashStats,
        salaries: salaryStats,
        pettyExpenses: pettyStats,
        budgets: budgetAlerts,
        employees,
      },
    });
  })
);

// Get KPIs summary
router.get(
  '/kpis/summary',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const [billStats, cardStats, cashStats, salaryStats] = await Promise.all([
      BillService.getBillStats(userId),
      CardService.getCardStats(userId),
      CashTransactionService.getTransactionStats(userId),
      SalaryService.getSalaryStats(),
    ]);

    const kpis = {
      totalBills: billStats.total,
      pendingBills: billStats.pending,
      totalCardBalance: cardStats.totalBalance,
      netCash: cashStats.net,
      monthlyPayroll: salaryStats.totalPayroll,
    };

    res.json({
      success: true,
      data: kpis,
    });
  })
);

// Get expenses chart data
router.get(
  '/charts/expenses',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    // Get cash transactions by category
    const transactions = await CashTransactionService.getTransactions(userId);
    
    const expensesByCategory = transactions
      .filter((t) => t.type === 'expense')
      .reduce(
        (acc, t) => {
          const category = t.category || 'Uncategorized';
          acc[category] = (acc[category] || 0) + t.amount;
          return acc;
        },
        {} as Record<string, number>
      );

    const chartData = Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value,
    }));

    res.json({
      success: true,
      data: chartData,
    });
  })
);

// Get budget status chart
router.get(
  '/charts/budget-status',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const alerts = await BudgetService.checkBudgetAlerts();

    const chartData = alerts.map((alert) => ({
      category: alert.category,
      spent: (alert.percentage / 100) * 100,
      remaining: Math.max(0, 100 - alert.percentage),
      percentage: alert.percentage,
      exceeded: alert.exceeded,
    }));

    res.json({
      success: true,
      data: chartData,
    });
  })
);

// Get monthly trend
router.get(
  '/charts/monthly-trend',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const months = 6;
    const trendData: any[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStr = date.toISOString().slice(0, 7);

      const billStats = await BillService.getBillStats(userId);
      const cashStats = await CashTransactionService.getTransactionStats(userId);

      trendData.push({
        month: monthStr,
        bills: billStats.total,
        income: cashStats.income,
        expense: cashStats.expense,
      });
    }

    res.json({
      success: true,
      data: trendData,
    });
  })
);

// Get recent transactions
router.get(
  '/recent-transactions',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const [bills, transactions] = await Promise.all([
      BillService.getBills(userId),
      CashTransactionService.getTransactions(userId),
    ]);

    // Combine and sort by date
    const allTransactions = [
      ...bills.slice(0, limit / 2).map((b) => ({
        id: b.id,
        type: 'bill',
        description: b.vendor_name,
        amount: b.amount,
        date: b.bill_date,
        status: b.status,
      })),
      ...transactions.slice(0, limit / 2).map((t) => ({
        id: t.id,
        type: 'transaction',
        description: t.description,
        amount: t.amount,
        date: t.transaction_date,
        transactionType: t.type,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({
      success: true,
      data: allTransactions.slice(0, limit),
    });
  })
);

export default router;
