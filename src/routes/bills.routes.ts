import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// Get all bills
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get all bills' });
  })
);

// Get bill by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get bill by ID' });
  })
);

// Create bill
router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Create bill' });
  })
);

// Update bill
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Update bill' });
  })
);

// Delete bill
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Delete bill' });
  })
);

// Export bills
router.get(
  '/export/pdf',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Export bills as PDF' });
  })
);

router.get(
  '/export/excel',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Export bills as Excel' });
  })
);

// Upload bill attachment
router.post(
  '/:id/upload',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Upload bill attachment' });
  })
);

export default router;
