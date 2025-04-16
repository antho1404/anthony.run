import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { getOrCreateUserWithStripeCustomer } from "./lib/stripe/subscription";
import { NextResponse } from "next/server";

const publicRoutes = createRouteMatcher(["/", "/api(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (publicRoutes(req)) return;
  
  const session = await auth.protect();
  
  // Skip this for API routes
  if (!req.url.includes("/api/")) {
    try {
      // Ensure user exists in our database with Stripe customer
      if (session.userId && session.user?.emailAddresses?.[0]?.emailAddress) {
        await getOrCreateUserWithStripeCustomer(
          session.userId,
          session.user.emailAddresses[0].emailAddress
        );
      }
    } catch (error) {
      console.error("Error syncing user with Stripe:", error);
      // Don't block the request if this fails
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
