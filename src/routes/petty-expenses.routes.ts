import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { PettyExpensesService } from '../services/petty-expenses.service';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const pettyExpensesService = new PettyExpensesService();

/**
 * @swagger
 * tags:
 *   name: Petty Expenses
 *   description: Petty expense management endpoints
 */

/**
 * @swagger
 * /api/petty-expenses/summary/monthly:
 *   get:
 *     summary: Get monthly petty expenses summary
 *     tags: [Petty Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: string
 *           example: '2025'
 *     responses:
 *       200:
 *         description: Monthly summary
 *       400:
 *         description: Missing month/year
 */
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

/**
 * @swagger
 * /api/petty-expenses:
 *   get:
 *     summary: Get all petty expenses
 *     tags: [Petty Expenses]
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
 *         name: categoryId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of expenses
 */
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

/**
 * @swagger
 * /api/petty-expenses:
 *   post:
 *     summary: Create a petty expense
 *     tags: [Petty Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PettyExpense'
 *     responses:
 *       201:
 *         description: Expense created
 */
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

/**
 * @swagger
 * /api/petty-expenses/{id}:
 *   get:
 *     summary: Get petty expense by ID
 *     tags: [Petty Expenses]
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
 *         description: Expense details
 *       404:
 *         description: Not found
 */
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

/**
 * @swagger
 * /api/petty-expenses/{id}:
 *   put:
 *     summary: Update a petty expense
 *     tags: [Petty Expenses]
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
 *             $ref: '#/components/schemas/PettyExpense'
 *     responses:
 *       200:
 *         description: Expense updated
 */
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

/**
 * @swagger
 * /api/petty-expenses/{id}:
 *   delete:
 *     summary: Delete a petty expense
 *     tags: [Petty Expenses]
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
 *         description: Expense deleted
 */
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
