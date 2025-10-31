import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { BillsService } from '../services/bills.service';
import multer from 'multer';
import storageService from '../db/storage';

const router = Router();
const upload = multer();

/**
 * @swagger
 * tags:
 *   name: Bills
 *   description: Bill management endpoints
 */

/**
 * @swagger
 * /api/bills:
 *   get:
 *     summary: Get all bills
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter bills from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter bills until this date
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, overdue]
 *         description: Filter by bill status
 *     responses:
 *       200:
 *         description: List of bills
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bill'
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /api/bills/{id}:
 *   get:
 *     summary: Get bill by ID
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bill ID
 *     responses:
 *       200:
 *         description: Bill details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bill'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bill not found
 */
// Get bill by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const bill = await BillsService.getBillById(req.params.id);
    res.json(bill);
  })
);

/**
 * @swagger
 * /api/bills:
 *   post:
 *     summary: Create a new bill
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vendor_name
 *               - amount
 *               - due_date
 *             properties:
 *               vendor_name:
 *                 type: string
 *                 example: ABC Suppliers
 *               bill_number:
 *                 type: string
 *                 example: INV-2024-001
 *               amount:
 *                 type: number
 *                 format: decimal
 *                 example: 1500.00
 *               due_date:
 *                 type: string
 *                 format: date
 *                 example: 2024-12-31
 *               status:
 *                 type: string
 *                 enum: [pending, paid, overdue]
 *                 example: pending
 *               category:
 *                 type: string
 *                 example: Office Supplies
 *               notes:
 *                 type: string
 *                 example: Monthly office supplies
 *     responses:
 *       201:
 *         description: Bill created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bill'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
// Create bill
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const bill = await BillsService.createBill(req.body, req.user!.id);
    res.status(201).json(bill);
  })
);

/**
 * @swagger
 * /api/bills/{id}:
 *   put:
 *     summary: Update a bill
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bill ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               vendor_name:
 *                 type: string
 *               bill_number:
 *                 type: string
 *               amount:
 *                 type: number
 *                 format: decimal
 *               due_date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [pending, paid, overdue]
 *               category:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bill updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bill'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bill not found
 */
// Update bill
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const bill = await BillsService.updateBill(req.params.id, req.body, req.user?.id);
    res.json(bill);
  })
);

/**
 * @swagger
 * /api/bills/{id}:
 *   delete:
 *     summary: Delete a bill
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bill ID
 *     responses:
 *       200:
 *         description: Bill deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Bill deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Bill not found
 */
// Delete bill
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const result = await BillsService.deleteBill(req.params.id);
    res.json(result);
  })
);

/**
 * @swagger
 * /api/bills/stats/summary:
 *   get:
 *     summary: Get bill statistics
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Statistics start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Statistics end date
 *     responses:
 *       200:
 *         description: Bill statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_bills:
 *                   type: integer
 *                 total_amount:
 *                   type: number
 *                 paid_bills:
 *                   type: integer
 *                 pending_bills:
 *                   type: integer
 *                 overdue_bills:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
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

// Get bill statistics
router.get(
  '/export/excel',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Excel export - to be implemented' });
  })
);

/**
 * @swagger
 * /api/bills/{id}/upload:
 *   post:
 *     summary: Upload bill attachment
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Bill ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Bill attachment file (PDF, image, etc.)
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 url:
 *                   type: string
 *                   description: Public URL of the uploaded file
 *                 path:
 *                   type: string
 *                   description: Storage path
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Upload failed
 */
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
