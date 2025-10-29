import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// Get all cards
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get all cards' });
  })
);

// Get card by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get card by ID' });
  })
);

// Create card
router.post(
  '/',
  authenticate,
  isAdmin,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Create card' });
  })
);

// Update card
router.put(
  '/:id',
  authenticate,
  isAdmin,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Update card' });
  })
);

// Delete card
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Delete card' });
  })
);

// Get card balance
router.get(
  '/:id/balance',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get card balance' });
  })
);

// Update card balance
router.put(
  '/:id/balance',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Update card balance' });
  })
);

export default router;
