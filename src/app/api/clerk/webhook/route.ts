import { clerkClient } from "@/lib/clerk";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";

type Event<T extends string, Data> = {
  data: Data;
  type: T;
};

type User = {
  id: string;
  external_accounts?: {
    provider: string;
    provider_user_id?: string;
  }[];
};

type UserCreatedEvent = Event<"user.created", User>;

type ClerkEvent = UserCreatedEvent;

export async function POST(req: NextRequest) {
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature)
    return new Response("Missing svix headers", { status: 400 });

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret)
    return new Response("Webhook secret not configured", { status: 500 });

  const wh = new Webhook(webhookSecret);
  let evt: ClerkEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkEvent;
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  // Handle user.created event
  if (evt.type === "user.created") {
    const githubAccount = evt.data.external_accounts?.find(
      (account: { provider: string; provider_user_id?: string }) =>
        account.provider === "oauth_github"
    );

    if (githubAccount && githubAccount.provider_user_id)
      await clerkClient.users.updateUser(evt.data.id, {
        externalId: githubAccount.provider_user_id,
      });
  }

  return NextResponse.json({ success: true });
}
