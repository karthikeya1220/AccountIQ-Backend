import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: Session management endpoints
 */

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Get all active sessions (Admin only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active sessions
 */
// Get all active sessions
router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get all active sessions' });
  })
);

/**
 * @swagger
 * /api/sessions/user:
 *   get:
 *     summary: Get sessions for current user
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sessions for the current user
 */
// Get user sessions
router.get(
  '/user',
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Get current user sessions' });
  })
);

/**
 * @swagger
 * /api/sessions/{sessionId}:
 *   delete:
 *     summary: Revoke a session (Admin only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session revoked
 */
// Revoke session (admin only)
router.delete(
  '/:sessionId',
  authenticate,
  isAdmin,
  asyncHandler(async (req, res) => {
    res.json({ message: 'Revoke session' });
  })
);

/**
 * @swagger
 * /api/sessions/user/{userId}/all:
 *   delete:
 *     summary: Revoke all sessions for a user (Admin only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All sessions revoked for user
 */
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
