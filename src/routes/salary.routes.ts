import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// Get all salaries
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get all salaries' });
  })
);

// Create salary
router.post(
  '/',
  authenticate,
  isAdmin,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Create salary' });
  })
);

// Get salary by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get salary by ID' });
  })
);

// Update salary
router.put(
  '/:id',
  authenticate,
  isAdmin,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Update salary' });
  })
);

// Get employee salary history
router.get(
  '/employee/:employeeId',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get employee salary history' });
  })
);

// Mark salary as paid
router.put(
  '/:id/mark-paid',
  authenticate,
  isAdmin,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Mark salary as paid' });
  })
);

export default router;
