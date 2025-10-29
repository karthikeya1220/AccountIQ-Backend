import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { BillService } from '../services';
import { createBillSchema, updateBillSchema, billFilterSchema } from '../validators';
import { ZodError } from 'zod';

const router = Router();

// Get all bills
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const filters = billFilterSchema.parse(req.query);
      const bills = await BillService.getBills(req.user!.userId, filters);
      const stats = await BillService.getBillStats(req.user!.userId);

      res.json({
        success: true,
        data: bills,
        stats,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ success: false, error: 'Invalid filters', details: error.errors });
      }
      throw error;
    }
  })
);

// Get bill by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const bill = await BillService.getBillById(id, req.user!.userId);

    if (!bill) {
      return res.status(404).json({ success: false, error: 'Bill not found' });
    }

    res.json({ success: true, data: bill });
  })
);

// Create bill
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const billData = createBillSchema.parse(req.body);
      const bill = await BillService.createBill(billData, req.user!.userId);

      res.status(201).json({
        success: true,
        message: 'Bill created successfully',
        data: bill,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
      }
      throw error;
    }
  })
);

// Update bill
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const billData = updateBillSchema.parse(req.body);
      const bill = await BillService.updateBill(id, billData, req.user!.userId);

      res.json({
        success: true,
        message: 'Bill updated successfully',
        data: bill,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
      }
      throw error;
    }
  })
);

// Delete bill
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await BillService.deleteBill(id, req.user!.userId);

    res.json({
      success: true,
      message: 'Bill deleted successfully',
    });
  })
);

// Get bill statistics
router.get(
  '/stats/summary',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const stats = await BillService.getBillStats(req.user!.userId);
    res.json({ success: true, data: stats });
  })
);

export default router;
