import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// Get all reminders
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get all reminders' });
  })
);

// Create reminder
router.post(
  '/',
  authenticate,
  isAdmin,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Create reminder' });
  })
);

// Get reminder by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get reminder by ID' });
  })
);

// Update reminder
router.put(
  '/:id',
  authenticate,
  isAdmin,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Update reminder' });
  })
);

// Delete reminder
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Delete reminder' });
  })
);

// Get upcoming reminders
router.get(
  '/upcoming/today',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get upcoming reminders' });
  })
);

export default router;
