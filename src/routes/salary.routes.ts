import { Router, Request, Response } from 'express';
import { authenticate, isAdmin, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { SalaryService } from '../services/salary.service';

const router = Router();
const salaryService = new SalaryService();

/**
 * @swagger
 * tags:
 *   name: Salary
 *   description: Salary management endpoints
 */

/**
 * @swagger
 * /api/salary/employee/{employeeId}:
 *   get:
 *     summary: Get salary history for an employee
 *     tags: [Salary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Salary history list
 */
// Get employee salary history (must come before /:id to avoid route conflict)
router.get(
  '/employee/:employeeId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const salaries = await salaryService.getEmployeeSalaryHistory(req.params.employeeId);
    res.json({
      success: true,
      data: salaries,
    });
  })
);

/**
 * @swagger
 * /api/salary:
 *   get:
 *     summary: Get all salaries with optional filters
 *     tags: [Salary]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, paid]
 *     responses:
 *       200:
 *         description: List of salaries
 */
// Get all salaries
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { employeeId, month, status } = req.query;
    
    const salaries = await salaryService.getAllSalaries({
      employeeId: employeeId as string,
      month: month as string,
      status: status as string,
    });
    
    res.json({
      success: true,
      data: salaries,
    });
  })
);

/**
 * @swagger
 * /api/salary:
 *   post:
 *     summary: Create a salary record (Admin only)
 *     tags: [Salary]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Salary'
 *     responses:
 *       201:
 *         description: Salary created
 *       403:
 *         description: Forbidden - Admin only
 */
// Create salary
router.post(
  '/',
  authenticate,
  isAdmin,
  asyncHandler(async (req: AuthRequest, res) => {
    const salary = await salaryService.createSalary(req.body);
    res.status(201).json({
      success: true,
      data: salary,
    });
  })
);

/**
 * @swagger
 * /api/salary/{id}:
 *   get:
 *     summary: Get salary by ID
 *     tags: [Salary]
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
 *         description: Salary details
 *       404:
 *         description: Not found
 */
// Get salary by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const salary = await salaryService.getSalaryById(req.params.id);
    res.json({
      success: true,
      data: salary,
    });
  })
);

/**
 * @swagger
 * /api/salary/{id}:
 *   put:
 *     summary: Update a salary (Admin only)
 *     tags: [Salary]
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
 *             $ref: '#/components/schemas/Salary'
 *     responses:
 *       200:
 *         description: Salary updated
 *       403:
 *         description: Forbidden - Admin only
 */
// Update salary
router.put(
  '/:id',
  authenticate,
  isAdmin,
  asyncHandler(async (req: AuthRequest, res) => {
    const salary = await salaryService.updateSalary(req.params.id, req.body);
    res.json({
      success: true,
      data: salary,
    });
  })
);

/**
 * @swagger
 * /api/salary/{id}/mark-paid:
 *   put:
 *     summary: Mark a salary as paid (Admin only)
 *     tags: [Salary]
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
 *         description: Salary marked as paid
 *       403:
 *         description: Forbidden - Admin only
 */
// Mark salary as paid
router.put(
  '/:id/mark-paid',
  authenticate,
  isAdmin,
  asyncHandler(async (req: AuthRequest, res) => {
    const salary = await salaryService.markAsPaid(req.params.id);
    res.json({
      success: true,
      data: salary,
    });
  })
);

export default router;
