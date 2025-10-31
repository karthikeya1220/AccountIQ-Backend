import { Router, Request, Response } from 'express';
import { authenticate, isAdmin, AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/error.middleware';
import { CardsService } from '../services/cards.service';
import { createCardSchema } from '../validators';
import { ZodError } from 'zod';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cards
 *   description: Credit/Debit card management endpoints
 */

/**
 * @swagger
 * /api/cards:
 *   get:
 *     summary: Get all active cards with stats
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of cards and stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Card'
 *                 stats:
 *                   type: object
 *                   description: Aggregated card statistics
 */
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

/**
 * @swagger
 * /api/cards/{id}:
 *   get:
 *     summary: Get card by ID
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Card ID
 *     responses:
 *       200:
 *         description: Card details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Card'
 *       404:
 *         description: Card not found
 */
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

/**
 * @swagger
 * /api/cards:
 *   post:
 *     summary: Create a new card
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - card_number
 *               - card_holder
 *               - card_type
 *               - bank
 *               - expiry_date
 *             properties:
 *               card_number:
 *                 type: string
 *                 example: '1234'
 *               card_holder:
 *                 type: string
 *                 example: John Doe
 *               card_type:
 *                 type: string
 *                 enum: [credit, debit]
 *               bank:
 *                 type: string
 *                 example: Example Bank
 *               expiry_date:
 *                 type: string
 *                 format: date
 *                 example: 2026-12-31
 *               card_limit:
 *                 type: number
 *                 example: 5000
 *     responses:
 *       201:
 *         description: Card created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Card'
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation errors
 */
// Create card
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    try {
      const cardData = createCardSchema.parse(req.body);
      const card = await CardsService.createCard(cardData);

      res.status(201).json({
        success: true,
        data: card,
        message: 'Card created successfully',
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ success: false, errors: error.errors });
      }
      throw error;
    }
  })
);

/**
 * @swagger
 * /api/cards/{id}:
 *   put:
 *     summary: Update a card
 *     tags: [Cards]
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
 *             type: object
 *             properties:
 *               card_number:
 *                 type: string
 *               card_holder:
 *                 type: string
 *               card_type:
 *                 type: string
 *                 enum: [credit, debit]
 *               bank:
 *                 type: string
 *               expiry_date:
 *                 type: string
 *                 format: date
 *               card_limit:
 *                 type: number
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Card updated successfully
 *       400:
 *         description: Validation errors
 *       404:
 *         description: Card not found
 */
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

/**
 * @swagger
 * /api/cards/{id}:
 *   delete:
 *     summary: Delete a card
 *     tags: [Cards]
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
 *         description: Card deleted successfully
 *       404:
 *         description: Card not found
 */
// Delete card (soft delete)
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

/**
 * @swagger
 * /api/cards/stats/summary:
 *   get:
 *     summary: Get card statistics summary
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Card stats data
 */
// Get card statistics
router.get(
  '/stats/summary',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await CardsService.getCardStats();
    res.json({ success: true, data: stats });
  })
);

export default router;
