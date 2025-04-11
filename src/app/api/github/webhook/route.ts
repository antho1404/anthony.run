import { addInstallation, removeInstallation } from "@/lib/github";
import { webhooks as webhooksType } from "@octokit/openapi-webhooks-types";
import { Webhooks } from "@octokit/webhooks";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type Event<E extends keyof webhooksType> =
  webhooksType[E]["post"]["requestBody"]["content"]["application/json"];

export async function POST(req: NextRequest) {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret)
    return new Response("Webhook secret not configured", { status: 500 });
  const webhooks = new Webhooks({ secret });

  const headersPayload = await headers();
  const signature = headersPayload.get("x-hub-signature-256") || "";
  const rawBody = await req.text();

  if (!(await webhooks.verify(rawBody, signature)))
    return new Response("Unauthorized", { status: 401 });

  const event = headersPayload.get("x-github-event");

  if (event === "installation") {
    const payload = JSON.parse(rawBody) as Event<
      "installation-created" | "installation-deleted"
    >;
    if (payload.action === "created")
      await addInstallation(payload.sender.id, payload.installation.id);
    if (payload.action === "deleted")
      await removeInstallation(payload.sender.id, payload.installation.id);
  }

  return NextResponse.json({ success: true });
}
