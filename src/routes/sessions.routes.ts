import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

// Get all active sessions
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get all active sessions' });
  })
);

// Get user sessions
router.get(
  '/user',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get current user sessions' });
  })
);

// Revoke session (admin only)
router.delete(
  '/:sessionId',
  authenticate,
  isAdmin,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Revoke session' });
  })
);

// Revoke all sessions for user (admin only)
router.delete(
  '/user/:userId/all',
  authenticate,
  isAdmin,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Revoke all user sessions' });
  })
);

export default router;
