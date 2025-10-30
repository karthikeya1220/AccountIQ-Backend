import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { SalaryService } from '../services/salary.service';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const salaryService = new SalaryService();

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
