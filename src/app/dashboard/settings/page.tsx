import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { STRIPE_PLANS } from "@/lib/stripe";
import { getUserSubscription } from "@/lib/stripe/subscription";
import { auth } from "@clerk/nextjs";
import { CheckIcon, CreditCardIcon } from "lucide-react";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Settings • anthony • run",
  description: "Manage your subscription and account settings",
};

export default async function SettingsPage() {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/');
  }

  const subscription = await getUserSubscription(userId);
  const currentPlan = subscription?.plan || 'FREE';

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-3xl font-bold mb-4">Account Settings</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Subscription</h2>
        <p className="text-muted-foreground mb-6">
          Manage your subscription and billing information
        </p>
        
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {Object.entries(STRIPE_PLANS).map(([planId, plan]) => {
            const isCurrentPlan = planId === currentPlan;
            
            return (
              <Card 
                key={planId} 
                className={`${isCurrentPlan ? 'border-primary' : ''}`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {plan.name}
                    {isCurrentPlan && (
                      <span className="text-xs font-medium bg-primary/10 text-primary py-1 px-2 rounded-full">
                        Current Plan
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    ${plan.price}/month
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Separator />
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isCurrentPlan ? (
                    <form action={async () => {
                      'use server';
                      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/create-portal`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ returnUrl: `/dashboard/settings` }),
                      });
                      const { url } = await response.json();
                      redirect(url);
                    }}>
                      <Button type="submit" className="w-full">
                        <CreditCardIcon className="mr-2 h-4 w-4" />
                        Manage Subscription
                      </Button>
                    </form>
                  ) : (
                    <form action={async () => {
                      'use server';
                      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/create-checkout`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          plan: planId,
                          returnUrl: `/dashboard/settings`
                        }),
                      });
                      const { url } = await response.json();
                      redirect(url);
                    }}>
                      <Button type="submit" variant={planId === 'FREE' ? 'outline' : 'default'} className="w-full">
                        {planId === 'FREE' ? 'Current Plan' : `Upgrade to ${plan.name}`}
                      </Button>
                    </form>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
      
      {subscription && (
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-2">Subscription Details</h3>
          <div className="bg-muted p-4 rounded-md">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">{subscription.status}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="font-medium">{STRIPE_PLANS[subscription.plan].name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Period</p>
                <p className="font-medium">
                  {new Date(subscription.currentPeriodStart).toLocaleDateString()} - 
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cancellation</p>
                <p className="font-medium">
                  {subscription.cancelAtPeriodEnd 
                    ? 'Cancels at end of period' 
                    : 'Active'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}