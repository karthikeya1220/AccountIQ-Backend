import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// Get all petty expenses
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get all petty expenses' });
  })
);

// Create petty expense
router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Create petty expense' });
  })
);

// Get expense by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get petty expense by ID' });
  })
);

// Update expense
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Update petty expense' });
  })
);

// Delete expense
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Delete petty expense' });
  })
);

// Get monthly summary
router.get(
  '/summary/monthly',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get monthly petty expenses summary' });
  })
);

export default router;
