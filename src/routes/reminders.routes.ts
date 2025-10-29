import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { ReminderService } from '../services';
import { createReminderSchema, updateReminderSchema } from '../validators';
import { ZodError } from 'zod';

const router = Router();

// Get all reminders
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const filters = {
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        type: req.query.type as string,
      };

      const reminders = await ReminderService.getReminders(req.user!.userId, filters);

      res.json({
        success: true,
        data: reminders,
      });
    } catch (error) {
      throw error;
    }
  })
);

// Create reminder
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const reminderData = createReminderSchema.parse(req.body);
      const reminder = await ReminderService.createReminder(reminderData, req.user!.userId);

      res.status(201).json({
        success: true,
        message: 'Reminder created successfully',
        data: reminder,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
      }
      throw error;
    }
  })
);

// Get reminder by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const reminder = await ReminderService.getReminderById(id, req.user!.userId);

    if (!reminder) {
      return res.status(404).json({ success: false, error: 'Reminder not found' });
    }

    res.json({ success: true, data: reminder });
  })
);

// Update reminder
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const reminderData = updateReminderSchema.parse(req.body);
      const reminder = await ReminderService.updateReminder(id, reminderData, req.user!.userId);

      res.json({
        success: true,
        message: 'Reminder updated successfully',
        data: reminder,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
      }
      throw error;
    }
  })
);

// Delete reminder
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await ReminderService.deleteReminder(id, req.user!.userId);

    res.json({
      success: true,
      message: 'Reminder deleted successfully',
    });
  })
);

// Get upcoming reminders
router.get(
  '/upcoming/next-days',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const days = req.query.days ? parseInt(req.query.days as string) : 7;
    const reminders = await ReminderService.getUpcomingReminders(days);

    res.json({
      success: true,
      data: reminders,
    });
  })
);

// Mark reminder as sent
router.put(
  '/:id/mark-sent',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const reminder = await ReminderService.markReminderAsSent(id);

    res.json({
      success: true,
      message: 'Reminder marked as sent',
      data: reminder,
    });
  })
);

export default router;
