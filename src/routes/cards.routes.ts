import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { CardService } from '../services';
import { createCardSchema, updateCardSchema } from '../validators';
import { ZodError } from 'zod';

const router = Router();

// Get all cards
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const cards = await CardService.getCards(req.user!.userId);
    const stats = await CardService.getCardStats(req.user!.userId);

    res.json({
      success: true,
      data: cards,
      stats,
    });
  })
);

// Get card by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const card = await CardService.getCardById(id, req.user!.userId);

    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }

    res.json({ success: true, data: card });
  })
);

// Create card
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const cardData = createCardSchema.parse(req.body);
      const card = await CardService.createCard(cardData, req.user!.userId);

      res.status(201).json({
        success: true,
        message: 'Card created successfully',
        data: card,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
      }
      throw error;
    }
  })
);

// Update card
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const cardData = updateCardSchema.parse(req.body);
      const card = await CardService.updateCard(id, cardData, req.user!.userId);

      res.json({
        success: true,
        message: 'Card updated successfully',
        data: card,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: error.errors });
      }
      throw error;
    }
  })
);

// Delete card (soft delete)
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await CardService.deleteCard(id, req.user!.userId);

    res.json({
      success: true,
      message: 'Card deleted successfully',
    });
  })
);

// Get card statistics
router.get(
  '/stats/summary',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const stats = await CardService.getCardStats(req.user!.userId);
    res.json({ success: true, data: stats });
  })
);

export default router;
