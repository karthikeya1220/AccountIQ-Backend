import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { CashTransactionsService } from '../services/cash-transactions.service';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cash Transactions
 *   description: Cash transaction management endpoints
 */

/**
 * @swagger
 * /api/cash-transactions:
 *   get:
 *     summary: Get all cash transactions with filters
 *     tags: [Cash Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transactions list with stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CashTransaction'
 *                 stats:
 *                   type: object
 *                   description: Summary statistics
 */
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

/**
 * @swagger
 * /api/cash-transactions:
 *   post:
 *     summary: Create a cash transaction
 *     tags: [Cash Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CashTransaction'
 *     responses:
 *       201:
 *         description: Transaction created successfully
 */
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

/**
 * @swagger
 * /api/cash-transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Cash Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Transaction details
 *       404:
 *         description: Not found
 */
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

/**
 * @swagger
 * /api/cash-transactions/{id}:
 *   put:
 *     summary: Update a transaction
 *     tags: [Cash Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CashTransaction'
 *     responses:
 *       200:
 *         description: Transaction updated
 */
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

/**
 * @swagger
 * /api/cash-transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     tags: [Cash Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Transaction deleted
 */
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

/**
 * @swagger
 * /api/cash-transactions/stats/summary:
 *   get:
 *     summary: Get transaction statistics summary
 *     tags: [Cash Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *     responses:
 *       200:
 *         description: Statistics summary
 */
// Get transaction statistics
router.get(
  '/stats/summary',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const stats = await CashTransactionsService.getTransactionStats({
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      userId: (req as AuthRequest).user!.id,
    });
    res.json({ success: true, data: stats });
  })
);

export default router;
