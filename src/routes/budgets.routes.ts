import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// Get all budgets
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get all budgets' });
  })
);

// Create budget
router.post(
  '/',
  authenticate,
  isAdmin,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Create budget' });
  })
);

// Get budget by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get budget by ID' });
  })
);

// Update budget
router.put(
  '/:id',
  authenticate,
  isAdmin,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Update budget' });
  })
);

// Delete budget
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Delete budget' });
  })
);

// Get budget alerts
router.get(
  '/alerts/current',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get budget alerts' });
  })
);

export default router;
