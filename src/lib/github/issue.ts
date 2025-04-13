import { getIssueDetails, getRepoUrl } from "@/lib/github";
import { Event } from "@/lib/github/type";
import { generatePromptFromIssue } from "@/lib/prompt";
import { run } from "@/lib/runner";
import { NextResponse } from "next/server";
import { invariant } from "ts-invariant";

const command = "@anthony.run";

export async function handleIssueEvent(
  payload: Event<"issues-opened" | "issues-edited">
) {
  if (!canProcessIssue(payload)) return;
  if (!payload.issue.body?.includes(command)) return;
  return await processIssueOrComment(payload);
}

export function handleIssueCommentEvent(
  payload: Event<"issue-comment-created" | "issue-comment-edited">
) {
  if (!canProcessIssue(payload)) return;
  if (!payload.comment.body?.includes(command)) return;
  return processIssueOrComment(payload);
}

function canProcessIssue({
  issue,
  installation,
}: Event<
  | "issues-opened"
  | "issues-edited"
  | "issue-comment-created"
  | "issue-comment-edited"
>) {
  if (issue.locked) return false;
  if (issue.pull_request) return false;
  if (issue.state === "closed") return false;
  if (!installation) return false;
  return true;
}

async function processIssueOrComment(
  payload: Event<
    | "issues-opened"
    | "issues-edited"
    | "issue-comment-created"
    | "issue-comment-edited"
  >
) {
  invariant(payload.installation);

  const issueDetails = await getIssueDetails(
    payload.repository.id,
    payload.issue.number,
    payload.installation.id
  );
  if (!issueDetails) return NextResponse.json({ success: true });

  const repoUrl = await getRepoUrl(
    payload.repository.id,
    payload.installation.id
  );
  if (!repoUrl) {
    console.log(`Repository with ID ${payload.repository.id} not found`);
    return NextResponse.json({ success: true });
  }

  // Create branch name from issue title
  const branchName = `issue-${payload.issue.id}-${payload.issue.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 30)}`;

  // Generate prompt from issue details
  const prompt = generatePromptFromIssue(
    issueDetails.issue,
    issueDetails.comments,
    issueDetails.repoFullName,
    issueDetails.repoOwner,
    issueDetails.repoName
  );

  // Run the task with the generated prompt and pass issue information for PR creation
  await run({
    repoUrl,
    prompt,
    branch: branchName,
    issueNumber: payload.issue.number,
    repoOwner: issueDetails.repoOwner,
    repoName: issueDetails.repoName,
    installationId: payload.installation.id,
  });
}
