import { Router, Request, Response } from 'express';
import { authenticate, isAdmin, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { RemindersService } from '../services/reminders.service';

const router = Router();
const remindersService = new RemindersService();

/**
 * @swagger
 * tags:
 *   name: Reminders
 *   description: Reminder management endpoints
 */

/**
 * @swagger
 * /api/reminders/upcoming/today:
 *   get:
 *     summary: Get upcoming reminders
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           example: 7
 *         description: Number of days ahead to include
 *     responses:
 *       200:
 *         description: List of upcoming reminders
 */
// Get upcoming reminders (must come before /:id to avoid route conflict)
router.get(
  '/upcoming/today',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { days } = req.query;
    const reminders = await remindersService.getUpcomingReminders(
      days ? parseInt(days as string) : 7
    );
    res.json(reminders);
  })
);

/**
 * @swagger
 * /api/reminders:
 *   get:
 *     summary: Get all reminders
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [bill, expense, salary, custom]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of reminders
 */
// Get all reminders
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { type, isActive, startDate, endDate } = req.query;
    
    const reminders = await remindersService.getAllReminders({
      type: type as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      startDate: startDate as string,
      endDate: endDate as string,
    });
    
    res.json(reminders);
  })
);

/**
 * @swagger
 * /api/reminders:
 *   post:
 *     summary: Create a reminder (Admin only)
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reminder'
 *     responses:
 *       201:
 *         description: Reminder created
 *       403:
 *         description: Forbidden - Admin only
 */
// Create reminder
router.post(
  '/',
  authenticate,
  isAdmin,
  asyncHandler(async (req: AuthRequest, res) => {
    const reminder = await remindersService.createReminder(req.body);
    res.status(201).json(reminder);
  })
);

/**
 * @swagger
 * /api/reminders/{id}:
 *   get:
 *     summary: Get reminder by ID
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Reminder details
 *       404:
 *         description: Not found
 */
// Get reminder by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const reminder = await remindersService.getReminderById(req.params.id);
    res.json(reminder);
  })
);

/**
 * @swagger
 * /api/reminders/{id}:
 *   put:
 *     summary: Update a reminder (Admin only)
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reminder'
 *     responses:
 *       200:
 *         description: Reminder updated
 *       403:
 *         description: Forbidden - Admin only
 */
// Update reminder
router.put(
  '/:id',
  authenticate,
  isAdmin,
  asyncHandler(async (req: AuthRequest, res) => {
    const reminder = await remindersService.updateReminder(req.params.id, req.body);
    res.json(reminder);
  })
);

/**
 * @swagger
 * /api/reminders/{id}:
 *   delete:
 *     summary: Delete a reminder (Admin only)
 *     tags: [Reminders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Reminder deleted
 *       403:
 *         description: Forbidden - Admin only
 */
// Delete reminder
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  asyncHandler(async (req: AuthRequest, res) => {
    await remindersService.deleteReminder(req.params.id);
    res.json({ message: 'Reminder deleted successfully' });
  })
);

export default router;
