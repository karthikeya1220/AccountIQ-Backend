import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { PettyExpensesService } from '../services/petty-expenses.service';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const pettyExpensesService = new PettyExpensesService();

// Get monthly summary (must come before /:id to avoid route conflict)
router.get(
  '/summary/monthly',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ 
        error: 'Month and year are required query parameters' 
      });
    }

    const summary = await pettyExpensesService.getMonthlySummary(
      month as string,
      year as string
    );
    res.json(summary);
  })
);

// Get all petty expenses
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { startDate, endDate, categoryId } = req.query;
    
    const expenses = await pettyExpensesService.getAllExpenses({
      startDate: startDate as string,
      endDate: endDate as string,
      categoryId: categoryId as string,
      userId: req.user?.id,
    });
    
    res.json({
      success: true,
      data: expenses,
    });
  })
);

// Create petty expense
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const expense = await pettyExpensesService.createExpense(
      req.body,
      req.user.id
    );
    
    res.status(201).json({
      success: true,
      data: expense,
    });
  })
);

// Get expense by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const expense = await pettyExpensesService.getExpenseById(req.params.id);
    res.json({
      success: true,
      data: expense,
    });
  })
);

// Update expense
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const expense = await pettyExpensesService.updateExpense(
      req.params.id,
      req.body
    );
    res.json({
      success: true,
      data: expense,
    });
  })
);

// Delete expense
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    await pettyExpensesService.deleteExpense(req.params.id);
    res.json({
      success: true,
      message: 'Petty expense deleted successfully',
    });
  })
);

export default router;
