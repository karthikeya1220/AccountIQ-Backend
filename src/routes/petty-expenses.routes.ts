import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { PettyExpenseService } from '../services';
import { createPettyExpenseSchema, updatePettyExpenseSchema } from '../validators';
import { ZodError } from 'zod';

const router = Router();

// Get all petty expenses
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const filters = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        isApproved: req.query.isApproved === 'true' ? true : req.query.isApproved === 'false' ? false : undefined,
        category: req.query.category as string,
      };

      const expenses = await PettyExpenseService.getExpenses(req.user!.userId, filters);
      const stats = await PettyExpenseService.getExpenseStats(req.user!.userId);

      res.json({
        success: true,
        data: expenses,
        stats,
      });
    } catch (error) {
      throw error;
    }
  })
);

// Create petty expense
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const expenseData = createPettyExpenseSchema.parse(req.body);
      const expense = await PettyExpenseService.createExpense(expenseData, req.user!.userId);

      res.status(201).json({
        success: true,
        message: 'Petty expense created successfully',
        data: expense,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
      }
      throw error;
    }
  })
);

// Get expense by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const expense = await PettyExpenseService.getExpenseById(id, req.user!.userId);

    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    res.json({ success: true, data: expense });
  })
);

// Update expense
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const expenseData = updatePettyExpenseSchema.parse(req.body);
      const expense = await PettyExpenseService.updateExpense(id, expenseData, req.user!.userId);

      res.json({
        success: true,
        message: 'Petty expense updated successfully',
        data: expense,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
      }
      throw error;
    }
  })
);

// Delete expense
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await PettyExpenseService.deleteExpense(id, req.user!.userId);

    res.json({
      success: true,
      message: 'Petty expense deleted successfully',
    });
  })
);

// Get expense statistics
router.get(
  '/stats/summary',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const stats = await PettyExpenseService.getExpenseStats(req.user!.userId);
    res.json({ success: true, data: stats });
  })
);

// Get monthly summary
router.get(
  '/summary/monthly',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth();

    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

    const expenses = await PettyExpenseService.getExpenses(req.user!.userId, {
      startDate,
      endDate,
    });

    const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    res.json({
      success: true,
      data: {
        expenses,
        total,
        month: `${year}-${String(month + 1).padStart(2, '0')}`,
      },
    });
  })
);

export default router;
