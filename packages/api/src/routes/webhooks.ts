import { Router, Request, Response } from 'express';
import { handleWebhook } from '../services/stripe';
import { logger } from '../utils/logger';

const router = Router();

// POST /webhooks/stripe — raw body required
router.post('/stripe', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    if (!signature) {
      res.status(400).json({ error: { code: 'MISSING_SIGNATURE', message: 'Missing stripe-signature header' } });
      return;
    }

    await handleWebhook(req.body as Buffer, signature);
    res.json({ received: true });
  } catch (err) {
    logger.error({ message: 'Webhook error', error: (err as Error).message });
    res.status(400).json({ error: { code: 'WEBHOOK_ERROR', message: 'Webhook processing failed' } });
  }
});

export default router;
