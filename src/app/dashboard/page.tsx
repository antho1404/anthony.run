import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CircleAlertIcon,
  GithubIcon,
  HistoryIcon,
  SlidersIcon,
  CreditCardIcon,
} from "lucide-react";
import { getUserSubscription } from "@/lib/stripe/subscription";
import { STRIPE_PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard • anthony • run",
  description:
    "Get ready for a revolutionary app designed to transform issues into ready-to-merge pull requests — saving your team up to 90% of development time.",
};

export default async function Dashboard() {
  const { userId } = auth();
  
  // Get subscription info
  const subscription = userId ? await getUserSubscription(userId) : null;
  const currentPlan = subscription?.plan || 'FREE';
  
  // Calculate remaining free runs if on free plan
  let freeRunsRemaining = null;
  if (currentPlan === 'FREE' && userId) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const runCount = await prisma.run.count({
      where: {
        userId,
        createdAt: {
          gte: monthStart,
        },
      },
    });
    
    const FREE_TIER_LIMIT = 3;
    freeRunsRemaining = Math.max(0, FREE_TIER_LIMIT - runCount);
  }

  const links = [
    {
      icon: GithubIcon,
      title: "Connect GitHub",
      description: "Link your repositories",
      link: `https://github.com/apps/${
        process.env.GITHUB_APP_NAME || ""
      }/installations/select_target`,
    },
    {
      icon: CircleAlertIcon,
      title: "Solve an Issue",
      description: "Fix problems in your projects",
      link: "/dashboard/issues",
    },
    {
      icon: HistoryIcon,
      title: "History",
      description: "View your past activities",
      link: "/dashboard/history",
    },
    {
      icon: CreditCardIcon,
      title: "Subscription",
      description: "Manage your subscription",
      link: "/dashboard/settings",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto md:mt-10 space-y-8">
      {/* Subscription Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Subscription</span>
            <Badge variant={currentPlan === 'FREE' ? 'outline' : 'default'}>
              {STRIPE_PLANS[currentPlan].name} Plan
            </Badge>
          </CardTitle>
          <CardDescription>
            {currentPlan === 'FREE' 
              ? `You have ${freeRunsRemaining} free runs remaining this month` 
              : 'Unlimited runs available with your subscription'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentPlan === 'FREE' ? (
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Upgrade to Pro for unlimited runs and priority support
              </p>
              <Button asChild>
                <Link href="/dashboard/settings">
                  Upgrade Now
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Your subscription renews on {new Date(subscription?.currentPeriodEnd || Date.now()).toLocaleDateString()}
              </p>
              <Button variant="outline" asChild>
                <Link href="/dashboard/settings">
                  Manage Subscription
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Separator />
      
      <div>
        <h1 className="text-2xl font-bold mb-4">Get Started</h1>
        <div className="flex flex-col space-y-4">
          {links.map((link, i) => (
            <Button
              variant="outline"
              className="justify-start gap-3 h-auto p-3 group"
              key={i}
              asChild
            >
              <Link href={link.link}>
                <link.icon className="size-4" />
                <div className="flex flex-col items-start">
                  <span>{link.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {link.description}
                  </span>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
