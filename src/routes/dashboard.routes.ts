import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// Get dashboard data
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get dashboard data' });
  })
);

// Get KPIs
router.get(
  '/kpis/summary',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get KPI summary' });
  })
);

// Get expenses chart data
router.get(
  '/charts/expenses',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get expenses chart data' });
  })
);

// Get budget status chart
router.get(
  '/charts/budget-status',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get budget status chart' });
  })
);

// Get monthly trend
router.get(
  '/charts/monthly-trend',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get monthly trend chart' });
  })
);

export default router;
