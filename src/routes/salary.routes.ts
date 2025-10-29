import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { SalaryService } from '../services';
import { createSalarySchema, updateSalarySchema } from '../validators';
import { ZodError } from 'zod';

const router = Router();

// Get all salaries
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const filters = {
        employeeId: req.query.employeeId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        status: req.query.status as string,
      };

      const salaries = await SalaryService.getSalaries(filters);
      const stats = await SalaryService.getSalaryStats();

      res.json({
        success: true,
        data: salaries,
        stats,
      });
    } catch (error) {
      throw error;
    }
  })
);

// Create salary
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const salaryData = createSalarySchema.parse(req.body);
      const salary = await SalaryService.createSalary(salaryData, req.user!.userId);

      res.status(201).json({
        success: true,
        message: 'Salary created successfully',
        data: salary,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
      }
      throw error;
    }
  })
);

// Get salary by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const salary = await SalaryService.getSalaryById(id);

    if (!salary) {
      return res.status(404).json({ success: false, error: 'Salary not found' });
    }

    res.json({ success: true, data: salary });
  })
);

// Update salary
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const salaryData = updateSalarySchema.parse(req.body);
      const salary = await SalaryService.updateSalary(id, salaryData);

      res.json({
        success: true,
        message: 'Salary updated successfully',
        data: salary,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
      }
      throw error;
    }
  })
);

// Delete salary
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await SalaryService.deleteSalary(id);

    res.json({
      success: true,
      message: 'Salary deleted successfully',
    });
  })
);

// Get employee salary history
router.get(
  '/employee/:employeeId',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { employeeId } = req.params;
    const salaries = await SalaryService.getSalaries({ employeeId });

    res.json({
      success: true,
      data: salaries,
    });
  })
);

// Get salary statistics
router.get(
  '/stats/summary',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const stats = await SalaryService.getSalaryStats();
    res.json({ success: true, data: stats });
  })
);

// Mark salary as paid
router.put(
  '/:id/mark-paid',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const salary = await SalaryService.updateSalary(id, {
      payment_status: 'paid',
      payment_date: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Salary marked as paid',
      data: salary,
    });
  })
);

export default router;
