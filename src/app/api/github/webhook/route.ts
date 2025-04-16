import { handleInstallationEvent } from "@/lib/github/installation";
import { handleIssueCommentEvent, handleIssueEvent } from "@/lib/github/issue";
import { webhooks as webhooksType } from "@octokit/openapi-webhooks-types";
import { Webhooks } from "@octokit/webhooks";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type Event<E extends keyof webhooksType> =
  webhooksType[E]["post"]["requestBody"]["content"]["application/json"];

export async function POST(req: NextRequest) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret)
    return new Response("Webhook secret not configured", { status: 500 });
  const webhooks = new Webhooks({ secret });

  const headersPayload = await headers();
  const signature = headersPayload.get("x-hub-signature-256") || "";
  const rawBody = await req.text();

  if (!(await webhooks.verify(rawBody, signature)))
    return new Response("Unauthorized", { status: 401 });

  const event = headersPayload.get("x-github-event");

  try {
    if (event === "installation")
      await handleInstallationEvent(
        JSON.parse(rawBody) as Event<
          "installation-created" | "installation-deleted"
        >
      );

    if (
      event === "issues" ||
      event === "issues-opened" ||
      event === "issues-edited"
    )
      await handleIssueEvent(
        JSON.parse(rawBody) as Event<"issues-opened" | "issues-edited">
      );

    if (
      event === "issue_comment" ||
      event === "issue-comment-created" ||
      event === "issue-comment-edited"
    )
      await handleIssueCommentEvent(
        JSON.parse(rawBody) as Event<
          "issue-comment-created" | "issue-comment-edited"
        >
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
