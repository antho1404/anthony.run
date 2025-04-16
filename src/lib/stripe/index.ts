import Stripe from 'stripe';
import { SubscriptionPlan, SubscriptionStatus } from '../prisma/generated/client';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export const STRIPE_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    features: ['Limited number of runs', 'Basic support'],
  },
  PRO: {
    name: 'Pro',
    price: 9.99,
    features: ['Unlimited runs', 'Priority support', 'Enhanced analytics'],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 49.99,
    features: ['Unlimited runs', 'Dedicated support', 'Advanced security', 'Custom solutions'],
  },
};

export const STRIPE_PRODUCT_IDS: Record<SubscriptionPlan, string> = {
  FREE: process.env.STRIPE_FREE_PRODUCT_ID || '',
  PRO: process.env.STRIPE_PRO_PRODUCT_ID || '',
  ENTERPRISE: process.env.STRIPE_ENTERPRISE_PRODUCT_ID || '',
};

export const STRIPE_PRICE_IDS: Record<SubscriptionPlan, string> = {
  FREE: process.env.STRIPE_FREE_PRICE_ID || '',
  PRO: process.env.STRIPE_PRO_PRICE_ID || '',
  ENTERPRISE: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
};

export function mapStripeSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case 'active':
      return 'ACTIVE';
    case 'past_due':
      return 'PAST_DUE';
    case 'canceled':
      return 'CANCELED';
    case 'unpaid':
      return 'UNPAID';
    case 'incomplete':
      return 'INCOMPLETE';
    case 'incomplete_expired':
      return 'INCOMPLETE_EXPIRED';
    case 'trialing':
      return 'TRIALING';
    case 'paused':
      return 'PAUSED';
    default:
      return 'INCOMPLETE';
  }
}

export function mapPlanFromPriceId(priceId: string): SubscriptionPlan {
  if (priceId === STRIPE_PRICE_IDS.PRO) return 'PRO';
  if (priceId === STRIPE_PRICE_IDS.ENTERPRISE) return 'ENTERPRISE';
  return 'FREE';
}

export async function createCheckoutSession({
  customerId,
  priceId,
  returnUrl,
}: {
  customerId: string;
  priceId: string;
  returnUrl: string;
}) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${returnUrl}?checkout_success=true`,
    cancel_url: `${returnUrl}?checkout_canceled=true`,
  });
}

export async function createCustomerPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export async function getOrCreateCustomer({
  email,
  userId,
}: {
  email: string;
  userId: string;
}) {
  // First, check if a customer already exists with this email
  const customers = await stripe.customers.list({ email });
  
  if (customers.data.length > 0) {
    return customers.data[0];
  }
  
  // If no customer exists, create a new one
  return stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });
}