import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { BudgetService } from '../services';
import { createBudgetSchema, updateBudgetSchema } from '../validators';
import { ZodError } from 'zod';

const router = Router();

// Get all budgets
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const filters = {
        period: req.query.period as string,
        category: req.query.category as string,
      };

      const budgets = await BudgetService.getBudgets(filters);

      res.json({
        success: true,
        data: budgets,
      });
    } catch (error) {
      throw error;
    }
  })
);

// Create budget
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const budgetData = createBudgetSchema.parse(req.body);
      const budget = await BudgetService.createBudget(budgetData, req.user!.userId);

      res.status(201).json({
        success: true,
        message: 'Budget created successfully',
        data: budget,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
      }
      throw error;
    }
  })
);

// Get budget by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const budget = await BudgetService.getBudgetById(id);

    if (!budget) {
      return res.status(404).json({ success: false, error: 'Budget not found' });
    }

    res.json({ success: true, data: budget });
  })
);

// Update budget
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const budgetData = updateBudgetSchema.parse(req.body);
      const budget = await BudgetService.updateBudget(id, budgetData);

      res.json({
        success: true,
        message: 'Budget updated successfully',
        data: budget,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
      }
      throw error;
    }
  })
);

// Delete budget (soft delete)
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await BudgetService.deleteBudget(id);

    res.json({
      success: true,
      message: 'Budget deleted successfully',
    });
  })
);

// Get budget alerts
router.get(
  '/alerts/current',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const alerts = await BudgetService.checkBudgetAlerts();
    
    res.json({
      success: true,
      data: alerts,
    });
  })
);

export default router;
