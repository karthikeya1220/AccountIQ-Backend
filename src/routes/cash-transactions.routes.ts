import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { CashTransactionService } from '../services';
import { createCashTransactionSchema, updateCashTransactionSchema } from '../validators';
import { ZodError } from 'zod';

const router = Router();

// Get all cash transactions
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const filters = {
        type: req.query.type as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        category: req.query.category as string,
      };

      const transactions = await CashTransactionService.getTransactions(req.user!.userId, filters);
      const stats = await CashTransactionService.getTransactionStats(req.user!.userId);

      res.json({
        success: true,
        data: transactions,
        stats,
      });
    } catch (error) {
      throw error;
    }
  })
);

// Create cash transaction
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const transactionData = createCashTransactionSchema.parse(req.body);
      const transaction = await CashTransactionService.createTransaction(transactionData, req.user!.userId);

      res.status(201).json({
        success: true,
        message: 'Cash transaction created successfully',
        data: transaction,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
      }
      throw error;
    }
  })
);

// Get transaction by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const transaction = await CashTransactionService.getTransactionById(id, req.user!.userId);

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    res.json({ success: true, data: transaction });
  })
);

// Update transaction
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const transactionData = updateCashTransactionSchema.parse(req.body);
      const transaction = await CashTransactionService.updateTransaction(id, transactionData, req.user!.userId);

      res.json({
        success: true,
        message: 'Cash transaction updated successfully',
        data: transaction,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
      }
      throw error;
    }
  })
);

// Delete transaction
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await CashTransactionService.deleteTransaction(id, req.user!.userId);

    res.json({
      success: true,
      message: 'Cash transaction deleted successfully',
    });
  })
);

// Get transaction statistics
router.get(
  '/stats/summary',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const stats = await CashTransactionService.getTransactionStats(req.user!.userId);
    res.json({ success: true, data: stats });
  })
);

export default router;
