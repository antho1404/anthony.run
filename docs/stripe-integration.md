# Stripe Integration Guide

This document provides instructions for setting up and configuring the Stripe integration for user subscriptions.

## Overview

The application uses Stripe to manage user subscriptions with three tiers:

- **Free Tier**: Limited to 3 runs per month
- **Pro Tier**: Unlimited runs and priority support
- **Enterprise Tier**: Unlimited runs with dedicated support and advanced features

## Setup Steps

### 1. Create Stripe Account

1. Sign up for a Stripe account at [stripe.com](https://stripe.com)
2. Once logged in, switch to test mode for development

### 2. Create Products and Pricing Plans

In the Stripe Dashboard:

1. Go to Products > Add Product
2. Create the following products and pricing plans:

   **Free Plan**
   - Name: Free
   - Price: $0 / month
   - Description: Limited number of runs, Basic support

   **Pro Plan**
   - Name: Pro
   - Price: $9.99 / month
   - Description: Unlimited runs, Priority support, Enhanced analytics

   **Enterprise Plan**
   - Name: Enterprise
   - Price: $49.99 / month
   - Description: Unlimited runs, Dedicated support, Advanced security, Custom solutions

3. Make note of the product and price IDs for each plan

### 3. Set Up Webhook

1. In the Stripe Dashboard, go to Developers > Webhooks
2. Click "Add Endpoint"
3. Enter your webhook URL: `https://your-domain.com/api/stripe/webhook`
4. Select events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Add Endpoint" to create the webhook
6. Get the webhook signing secret from the webhook details page

### 4. Configure Environment Variables

Add the following environment variables to your `.env` file:

```
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Product IDs
STRIPE_FREE_PRODUCT_ID=prod_...
STRIPE_PRO_PRODUCT_ID=prod_...
STRIPE_ENTERPRISE_PRODUCT_ID=prod_...

# Stripe Price IDs
STRIPE_FREE_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
```

### 5. Generate Prisma Client

After updating the schema, generate the Prisma client:

```bash
npx prisma generate
```

### 6. Run Database Migrations

Apply the database changes:

```bash
npx prisma migrate dev --name add-subscription-models
```

## Testing

### Test Subscription Flow

1. Log in to the application
2. Navigate to Dashboard > Settings
3. Choose a subscription plan
4. Use Stripe test card number `4242 4242 4242 4242` with any future expiration date and any CVC
5. Complete the checkout process
6. Verify subscription status in the dashboard

### Test Webhook Events

1. Use the Stripe CLI to trigger test webhook events:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
2. In another terminal, trigger a test event:
   ```bash
   stripe trigger customer.subscription.created
   ```
3. Check the application logs to verify the webhook was processed correctly

## Usage

### Subscription Management

Users can manage their subscriptions from the Settings page:

- View current plan and status
- Upgrade to a higher tier
- Access the Stripe Customer Portal to manage payment methods or cancel subscription

### Subscription Checking

The application automatically checks subscription status:

- Free users are limited to 3 runs per month
- The middleware ensures users with active subscriptions can access premium features
- The `requireSubscription()` utility function can be used in any route to enforce subscription requirements

## Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Testing Documentation](https://stripe.com/docs/testing)
- [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)