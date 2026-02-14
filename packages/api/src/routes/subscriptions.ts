import { Router, Request, Response } from 'express';
import { authenticate, requireOwner } from '../middleware/auth';
import {
  createCheckoutSession,
  createCustomerPortalSession,
  getSubscriptionStatus,
} from '../services/stripe';
import { prisma } from '../lib/prisma';

const router = Router();

// POST /subscriptions/checkout
router.post('/checkout', authenticate, requireOwner, async (req: Request, res: Response) => {
  try {
    const { plan } = req.body as { plan: 'monthly' | 'lifetime' };
    if (!plan || !['monthly', 'lifetime'].includes(plan)) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Plan must be "monthly" or "lifetime"' },
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      res.status(404).json({ error: { code: 'RESOURCE_NOT_FOUND', message: 'User not found' } });
      return;
    }

    if (user.tier === 'PRO') {
      res.status(400).json({
        error: { code: 'ALREADY_SUBSCRIBED', message: 'You already have a Pro subscription' },
      });
      return;
    }

    const checkoutUrl = await createCheckoutSession(user.id, user.email, plan);
    res.json({ checkoutUrl });
  } catch (err) {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create checkout session' },
    });
  }
});

// POST /subscriptions/portal
router.post('/portal', authenticate, requireOwner, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user?.stripeCustomerId) {
      res.status(400).json({
        error: { code: 'NO_SUBSCRIPTION', message: 'No active subscription found' },
      });
      return;
    }

    const portalUrl = await createCustomerPortalSession(user.stripeCustomerId);
    res.json({ portalUrl });
  } catch (err) {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create portal session' },
    });
  }
});

// GET /subscriptions/status
router.get('/status', authenticate, requireOwner, async (req: Request, res: Response) => {
  try {
    const status = await getSubscriptionStatus(req.user!.userId);
    res.json(status);
  } catch (err) {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get subscription status' },
    });
  }
});

export default router;
