import { Router } from 'express';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { RemindersService } from '../services/reminders.service';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();
const remindersService = new RemindersService();

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

// Get reminder by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const reminder = await remindersService.getReminderById(req.params.id);
    res.json(reminder);
  })
);

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
