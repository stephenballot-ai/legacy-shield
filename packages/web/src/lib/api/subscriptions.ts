import { api } from './client';

interface SubscriptionStatus {
  tier: 'FREE' | 'PRO';
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  lifetimePurchase: boolean;
  lifetimePurchaseDate: string | null;
  subscriptionEndsAt: string | null;
}

export const subscriptionsApi = {
  createCheckout: (plan: 'monthly' | 'lifetime') =>
    api.post<{ checkoutUrl: string }>('/subscriptions/checkout', { plan }),

  getPortalUrl: () =>
    api.post<{ portalUrl: string }>('/subscriptions/portal'),

  getStatus: () =>
    api.get<SubscriptionStatus>('/subscriptions/status'),
};
