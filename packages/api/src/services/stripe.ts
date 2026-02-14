import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

function getPriceId(plan: 'monthly' | 'lifetime'): string {
  if (plan === 'monthly') {
    const id = process.env.STRIPE_PRICE_ID_MONTHLY;
    if (!id) throw new Error('STRIPE_PRICE_ID_MONTHLY not configured');
    return id;
  }
  const id = process.env.STRIPE_PRICE_ID_LIFETIME;
  if (!id) throw new Error('STRIPE_PRICE_ID_LIFETIME not configured');
  return id;
}

export async function createCheckoutSession(
  userId: string,
  email: string,
  plan: 'monthly' | 'lifetime'
): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: plan === 'monthly' ? 'subscription' : 'payment',
    customer_email: user?.stripeCustomerId ? undefined : email,
    customer: user?.stripeCustomerId || undefined,
    line_items: [{ price: getPriceId(plan), quantity: 1 }],
    success_url: `${FRONTEND_URL}/settings?checkout=success`,
    cancel_url: `${FRONTEND_URL}/settings?checkout=cancelled`,
    metadata: { userId, plan },
  };

  const session = await stripe.checkout.sessions.create(sessionParams);
  if (!session.url) throw new Error('Failed to create checkout session');
  return session.url;
}

export async function createCustomerPortalSession(
  stripeCustomerId: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${FRONTEND_URL}/settings`,
  });
  return session.url;
}

export async function handleWebhook(
  payload: Buffer,
  signature: string
): Promise<void> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET not configured');

  const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan as 'monthly' | 'lifetime' | undefined;
      if (!userId) break;

      const customerId =
        typeof session.customer === 'string'
          ? session.customer
          : session.customer?.id;

      const updateData: Record<string, unknown> = {
        tier: 'PRO',
        stripeCustomerId: customerId || undefined,
      };

      if (plan === 'lifetime') {
        updateData.lifetimePurchase = true;
        updateData.lifetimePurchaseDate = new Date();
      } else {
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;
        updateData.stripeSubscriptionId = subscriptionId || undefined;
      }

      await prisma.user.update({ where: { id: userId }, data: updateData });
      logger.info({ message: 'User upgraded to PRO', userId, plan });
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

      const user = await prisma.user.findUnique({
        where: { stripeCustomerId: customerId },
      });
      if (!user || user.lifetimePurchase) break;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          tier: 'FREE',
          stripeSubscriptionId: null,
          subscriptionEndsAt: null,
        },
      });
      logger.info({ message: 'User downgraded to FREE', userId: user.id });
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

      const user = await prisma.user.findUnique({
        where: { stripeCustomerId: customerId },
      });
      if (!user) break;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionEndsAt: sub.current_period_end
            ? new Date(sub.current_period_end * 1000)
            : null,
        },
      });
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === 'string'
          ? invoice.customer
          : invoice.customer?.id;
      if (!customerId) break;

      const user = await prisma.user.findUnique({
        where: { stripeCustomerId: customerId },
      });
      if (user) {
        logger.warn({ message: 'Payment failed', userId: user.id });
        // Could send email notification here
      }
      break;
    }

    default:
      logger.info({ message: 'Unhandled Stripe event', type: event.type });
  }
}

export async function getSubscriptionStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      tier: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      lifetimePurchase: true,
      lifetimePurchaseDate: true,
      subscriptionEndsAt: true,
    },
  });
  if (!user) throw new Error('User not found');
  return user;
}
