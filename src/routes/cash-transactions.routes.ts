import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { CashTransactionsService } from '../services/cash-transactions.service';

const router = Router();

// Get all cash transactions
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      type: req.query.type as string,
      category: req.query.category as string,
    };

    const transactions = await CashTransactionsService.getAllTransactions(filters);
    const stats = await CashTransactionsService.getTransactionStats(filters);

    res.json({
      success: true,
      data: transactions,
      stats,
    });
  })
);

// Create cash transaction
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const transaction = await CashTransactionsService.createTransaction(req.body, req.user!.id);

    res.status(201).json({
      success: true,
      message: 'Cash transaction created successfully',
      data: transaction,
    });
  })
);

// Get transaction by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const transaction = await CashTransactionsService.getTransactionById(id);

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
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const transaction = await CashTransactionsService.updateTransaction(id, req.body);

    res.json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction,
    });
  })
);

// Delete transaction
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    await CashTransactionsService.deleteTransaction(id);

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
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
