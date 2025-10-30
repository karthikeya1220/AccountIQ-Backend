import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { BillsService } from '../services/bills.service';
import multer from 'multer';
import storageService from '../db/storage';

const router = Router();
const upload = multer();

// Get all bills
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { startDate, endDate, status } = req.query;
    const bills = await BillsService.getAllBills(req.user!.id, {
      startDate,
      endDate,
      status,
    });
    res.json(bills);
  })
);

// Get bill by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const bill = await BillsService.getBillById(req.params.id);
    res.json(bill);
  })
);

// Create bill
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const bill = await BillsService.createBill(req.body, req.user!.id);
    res.status(201).json(bill);
  })
);

// Update bill
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const bill = await BillsService.updateBill(req.params.id, req.body, req.user?.id);
    res.json(bill);
  })
);

// Delete bill
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await BillsService.deleteBill(req.params.id);
    res.json(result);
  })
);

// Get bill statistics
router.get(
  '/stats/summary',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { startDate, endDate } = req.query;
    const stats = await BillsService.getBillStats(
      req.user!.id,
      startDate as string,
      endDate as string
    );
    res.json(stats);
  })
);

// Export bills (placeholder - implement with PDFKit/XLSX)
router.get(
  '/export/pdf',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'PDF export - to be implemented' });
  })
);

router.get(
  '/export/excel',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Excel export - to be implemented' });
  })
);


// Upload bill attachment
router.post(
  '/:id/upload',
  authenticate,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const billId = req.params.id;
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    try {
      const result = await storageService.uploadBillAttachment(
        billId,
        req.file.buffer,
        req.file.originalname
      );
      res.status(201).json({ success: true, ...result });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      res.status(500).json({ success: false, error: errorMsg });
    }
  })
);

export default router;
