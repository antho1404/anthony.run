import { createCheckoutSession } from '@/lib/stripe';
import { STRIPE_PRICE_IDS } from '@/lib/stripe';
import { getOrCreateUserWithStripeCustomer } from '@/lib/stripe/subscription';
import { auth } from '@clerk/nextjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { plan, returnUrl } = await req.json();
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get priceId from the provided plan
    const priceId = STRIPE_PRICE_IDS[plan];
    if (!priceId) {
      return new NextResponse('Invalid plan', { status: 400 });
    }

    // Get user from our database with Clerk ID
    const user = await getOrCreateUserWithStripeCustomer(
      userId,
      auth().sessionClaims?.email as string
    );

    if (!user.stripeCustomerId) {
      return new NextResponse('No Stripe customer found for user', { status: 400 });
    }

    // Create a checkout session
    const session = await createCheckoutSession({
      customerId: user.stripeCustomerId,
      priceId,
      returnUrl: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
    console.error('Error creating checkout session:', error);
    return new NextResponse(errorMessage, { status: 500 });
  }
}