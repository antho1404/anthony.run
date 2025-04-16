import { auth } from "@clerk/nextjs";
import { isUserSubscribed } from "./stripe/subscription";
import { redirect } from "next/navigation";

export async function requireSubscription() {
  const { userId } = auth();
  
  if (!userId) {
    redirect('/');
  }
  
  const subscribed = await isUserSubscribed(userId);
  
  if (!subscribed) {
    redirect('/dashboard/settings?subscription_required=true');
  }
  
  return userId;
}