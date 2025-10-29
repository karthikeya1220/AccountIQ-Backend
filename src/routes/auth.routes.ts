import { Router } from 'express';
import { authenticate, authorize, isAdmin } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { UserRole } from '../types';

const router = Router();

// Login
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    // TODO: Implement login logic
    res.json({ message: 'Login endpoint' });
  })
);

// Register (admin only)
router.post(
  '/register',
  authenticate,
  isAdmin,
  asyncHandler(async (req, res) => {
    // TODO: Implement registration logic
    res.json({ message: 'Register endpoint' });
  })
);

// Refresh token
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    // TODO: Implement token refresh logic
    res.json({ message: 'Refresh token endpoint' });
  })
);

// Logout
router.post(
  '/logout',
  authenticate,
  asyncHandler(async (req, res) => {
    // TODO: Implement logout logic
    res.json({ message: 'Logout endpoint' });
  })
);

// Get current user
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  })
);

export default router;
