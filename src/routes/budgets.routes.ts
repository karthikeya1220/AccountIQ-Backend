import { Router, Request, Response } from 'express';
import { authenticate, isAdmin, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { BudgetsService } from '../services/budgets.service';

const router = Router();
const budgetsService = new BudgetsService();

/**
 * @swagger
 * tags:
 *   name: Budgets
 *   description: Budget management endpoints
 */

/**
 * @swagger
 * /api/budgets/alerts/current:
 *   get:
 *     summary: Get current budget alerts
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: number
 *           example: 0.8
 *         description: Alert threshold (0-1, default 0.8)
 *     responses:
 *       200:
 *         description: List of budget alerts
 */
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

/**
 * @swagger
 * /api/budgets:
 *   get:
 *     summary: Get all budgets
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [monthly, quarterly, yearly]
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of budgets
 */
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

/**
 * @swagger
 * /api/budgets:
 *   post:
 *     summary: Create a new budget (Admin only)
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Budget'
 *     responses:
 *       201:
 *         description: Budget created
 *       403:
 *         description: Forbidden - Admin only
 */
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

/**
 * @swagger
 * /api/budgets/{id}:
 *   get:
 *     summary: Get budget by ID
 *     tags: [Budgets]
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
 *         description: Budget details
 *       404:
 *         description: Not found
 */
// Get budget by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const budget = await budgetsService.getBudgetById(req.params.id);
    res.json(budget);
  })
);

/**
 * @swagger
 * /api/budgets/{id}:
 *   put:
 *     summary: Update a budget (Admin only)
 *     tags: [Budgets]
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
 *             $ref: '#/components/schemas/Budget'
 *     responses:
 *       200:
 *         description: Budget updated
 *       403:
 *         description: Forbidden - Admin only
 */
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

/**
 * @swagger
 * /api/budgets/{id}:
 *   delete:
 *     summary: Delete a budget (Admin only)
 *     tags: [Budgets]
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
 *         description: Budget deleted
 *       403:
 *         description: Forbidden - Admin only
 */
// Delete budget (soft delete)
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
