import { Router, Request, Response } from 'express';
import { authenticate, isAdmin, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { CardsService } from '../services/cards.service';
import { createCardSchema } from '../validators';
import { ZodError } from 'zod';

const router = Router();

// Get all cards
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const cards = await CardsService.getActiveCards();
    const stats = await CardsService.getCardStats();

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
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const card = await CardsService.getCardById(id);

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
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const cardData = createCardSchema.parse(req.body);
      const card = await CardsService.createCard({
        cardNumber: cardData.cardNumber,
        cardHolder: cardData.cardHolder,
        cardType: cardData.cardType,
        bank: cardData.bank,
        expiryDate: cardData.expiryDate,
        cardLimit: cardData.limit || 0,
        balance: 0,
        isActive: true,
      });

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
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const cardData = req.body;
      const card = await CardsService.updateCard(id, {
        cardNumber: cardData.card_number,
        cardHolder: cardData.card_holder,
        cardType: cardData.card_type,
        bank: cardData.bank,
        expiryDate: cardData.expiry_date,
        cardLimit: cardData.card_limit,
        isActive: cardData.is_active,
      });

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

// Delete card
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    await CardsService.deleteCard(id);

    res.json({
      success: true,
      message: 'Card deleted successfully',
    });
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
