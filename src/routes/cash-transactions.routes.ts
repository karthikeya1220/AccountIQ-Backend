import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// Get all cash transactions
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get all cash transactions' });
  })
);

// Create cash transaction
router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Create cash transaction' });
  })
);

// Get transaction by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get cash transaction by ID' });
  })
);

// Update transaction
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Update cash transaction' });
  })
);

// Delete transaction
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Delete cash transaction' });
  })
);

// Export cash transactions
router.get(
  '/export/excel',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Export cash transactions as Excel' });
  })
);

export default router;
