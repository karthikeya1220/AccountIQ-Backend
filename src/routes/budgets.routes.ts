import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { BudgetsService } from '../services/budgets.service';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const budgetsService = new BudgetsService();

// Get budget alerts (must come before /:id to avoid route conflict)
router.get(
  '/alerts/current',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { threshold } = req.query;
    const alerts = await budgetsService.getBudgetAlerts(
      threshold ? parseFloat(threshold as string) : 0.8
    );
    res.json(alerts);
  })
);

// Get all budgets
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { period, month, isActive } = req.query;
    
    const budgets = await budgetsService.getAllBudgets({
      period: period as string,
      month: month as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
    
    res.json(budgets);
  })
);

// Create budget
router.post(
  '/',
  authenticate,
  isAdmin,
  asyncHandler(async (req: AuthRequest, res) => {
    const budget = await budgetsService.createBudget(req.body);
    res.status(201).json(budget);
  })
);

// Get budget by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const budget = await budgetsService.getBudgetById(req.params.id);
    res.json(budget);
  })
);

// Update budget
router.put(
  '/:id',
  authenticate,
  isAdmin,
  asyncHandler(async (req: AuthRequest, res) => {
    const budget = await budgetsService.updateBudget(req.params.id, req.body);
    res.json(budget);
  })
);

// Delete budget
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  asyncHandler(async (req: AuthRequest, res) => {
    await budgetsService.deleteBudget(req.params.id);
    res.json({ message: 'Budget deleted successfully' });
  })
);

export default router;
