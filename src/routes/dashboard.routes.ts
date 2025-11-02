import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { dashboardService } from '../services/dashboard.service';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard statistics, KPIs, and analytics endpoints
 */

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get complete dashboard summary with all data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [current_month, last_30_days, custom_range]
 *           default: current_month
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: timeZone
 *         schema:
 *           type: string
 *           default: UTC
 *     responses:
 *       200:
 *         description: Complete dashboard summary with KPIs, charts, transactions, and alerts
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/summary',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user!.id;
    const userRole = (req as any).user!.role;

    const params = {
      period: (req.query.period as 'current_month' | 'last_30_days' | 'custom_range') || 'current_month',
      startDate: (req.query.startDate as string) || undefined,
      endDate: (req.query.endDate as string) || undefined,
      include: (req.query.include as string)?.split(',') || undefined,
      exclude: (req.query.exclude as string)?.split(',') || undefined,
      timeZone: (req.query.timeZone as string) || 'UTC',
    };

    const result = await dashboardService.getDashboardSummary(userId, userRole, params);
    res.status(200).json(result);
  })
);

/**
 * @swagger
 * /api/dashboard/kpis:
 *   get:
 *     summary: Get KPIs only (fast endpoint for quick updates)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [current_month, last_30_days]
 *           default: current_month
 *     responses:
 *       200:
 *         description: KPI metrics and metadata
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/kpis',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user!.id;
    const userRole = (req as any).user!.role;

    const params = {
      period: (req.query.period as 'current_month' | 'last_30_days') || 'current_month',
    };

    const result = await dashboardService.getDashboardSummary(userId, userRole, params);

    res.status(200).json({
      success: true,
      data: result.data.kpis,
      metadata: {
        timestamp: result.data.timestamp,
        cached: result.data.metadata.dataFreshness === 'cached',
      },
    });
  })
);

/**
 * @swagger
 * /api/dashboard/charts:
 *   get:
 *     summary: Get all chart data (monthly trend, expenses by category, budget status, cards)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chart data for visualizations
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/charts',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user!.id;
    const userRole = (req as any).user!.role;

    const result = await dashboardService.getDashboardSummary(userId, userRole);

    res.status(200).json({
      success: true,
      data: {
        monthlyTrend: result.data.monthlyTrend,
        expensesByCategory: result.data.expensesByCategory,
        budgetStatus: result.data.budgetStatus,
        cards: result.data.cards,
      },
      metadata: {
        timestamp: result.data.timestamp,
      },
    });
  })
);

/**
 * @swagger
 * /api/dashboard/alerts:
 *   get:
 *     summary: Get dashboard alerts (budget, approvals, bills)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Alert information
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/alerts',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user!.id;
    const userRole = (req as any).user!.role;

    const result = await dashboardService.getDashboardSummary(userId, userRole);

    res.status(200).json({
      success: true,
      data: result.data.alerts,
      metadata: {
        timestamp: result.data.timestamp,
      },
    });
  })
);

/**
 * @swagger
 * /api/dashboard/recent-transactions:
 *   get:
 *     summary: Get recent transactions (deprecated - use /summary instead)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Recent transactions list
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/recent-transactions',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user!.id;
    const userRole = (req as any).user!.role;

    const result = await dashboardService.getDashboardSummary(userId, userRole);

    res.status(200).json({
      success: true,
      data: result.data.recentTransactions,
      metadata: {
        timestamp: result.data.timestamp,
      },
    });
  })
);

/**
 * @swagger
 * /api/dashboard/kpis/summary:
 *   get:
 *     summary: Get KPI summary (deprecated - use /kpis instead)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KPI metrics
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/kpis/summary',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user!.id;
    const userRole = (req as any).user!.role;

    const result = await dashboardService.getDashboardSummary(userId, userRole);

    res.status(200).json({
      success: true,
      data: result.data.kpis,
    });
  })
);

/**
 * @swagger
 * /api/dashboard/charts/monthly-trend:
 *   get:
 *     summary: Get monthly trend chart data (deprecated - use /charts instead)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly trend data
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/charts/monthly-trend',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user!.id;
    const userRole = (req as any).user!.role;

    const result = await dashboardService.getDashboardSummary(userId, userRole);

    res.status(200).json({
      success: true,
      data: result.data.monthlyTrend,
    });
  })
);

/**
 * @swagger
 * /api/dashboard/charts/expenses:
 *   get:
 *     summary: Get expenses by category chart data (deprecated - use /charts instead)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expenses by category data
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/charts/expenses',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user!.id;
    const userRole = (req as any).user!.role;

    const result = await dashboardService.getDashboardSummary(userId, userRole);

    res.status(200).json({
      success: true,
      data: result.data.expensesByCategory,
    });
  })
);

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get dashboard overview (deprecated - use /summary instead)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user!.id;
    const userRole = (req as any).user!.role;

    const result = await dashboardService.getDashboardSummary(userId, userRole);

    res.status(200).json(result);
  })
);

export default router;
