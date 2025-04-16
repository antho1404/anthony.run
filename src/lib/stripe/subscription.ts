import { User } from '../prisma/generated/client';
import { prisma } from '../prisma';
import { tryCatch } from '../tryCatch';
import { getOrCreateCustomer, mapPlanFromPriceId, mapStripeSubscriptionStatus, stripe } from './index';
import Stripe from 'stripe';

export async function getOrCreateUserWithStripeCustomer(clerkUserId: string, email: string): Promise<User> {
  // Try to find existing user
  const existingUser = await prisma.user.findUnique({
    where: { id: clerkUserId },
  });

  if (existingUser) {
    // If user exists but doesn't have a Stripe customer ID, create one
    if (!existingUser.stripeCustomerId) {
      const customer = await getOrCreateCustomer({
        email,
        userId: clerkUserId,
      });

      return prisma.user.update({
        where: { id: clerkUserId },
        data: { stripeCustomerId: customer.id },
      });
    }
    return existingUser;
  }

  // Create new user with Stripe customer
  const { data: customer } = await tryCatch(
    getOrCreateCustomer({
      email,
      userId: clerkUserId,
    })
  );

  return prisma.user.create({
    data: {
      id: clerkUserId,
      email,
      stripeCustomerId: customer?.id,
    },
  });
}

export async function updateSubscriptionFromStripe(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0].price.id;
  const plan = mapPlanFromPriceId(priceId);
  const status = mapStripeSubscriptionStatus(subscription.status);
  const customerId = subscription.customer as string;

  // Find user by Stripe customer ID
  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
    include: { subscription: true },
  });

  if (!user) {
    throw new Error(`No user found with Stripe customer ID: ${customerId}`);
  }

  // If user has an existing subscription, update it; otherwise create a new one
  if (user.subscription) {
    return prisma.subscription.update({
      where: { id: user.subscription.id },
      data: {
        stripeSubscriptionId: subscription.id,
        status,
        plan,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
  }

  return prisma.subscription.create({
    data: {
      userId: user.id,
      stripeSubscriptionId: subscription.id,
      status,
      plan,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

export async function deleteSubscription(subscriptionId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (subscription) {
    await prisma.subscription.delete({
      where: { id: subscription.id },
    });
  }
}

export async function getUserSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  return user?.subscription;
}

export async function isUserSubscribed(userId: string) {
  const subscription = await getUserSubscription(userId);
  return subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING';
}

export async function handleSubscriptionEvent(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  if (event.type === 'customer.subscription.created' || 
      event.type === 'customer.subscription.updated') {
    await updateSubscriptionFromStripe(subscription.id);
  } else if (event.type === 'customer.subscription.deleted') {
    await deleteSubscription(subscription.id);
  }
}