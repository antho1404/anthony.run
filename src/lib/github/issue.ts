import { getIssueDetails, getRepoUrl } from "@/lib/github";
import { Event } from "@/lib/github/type";
import { generatePromptFromIssue } from "@/lib/prompt";
import { NextResponse } from "next/server";

const command = "@anthony.run";

export async function handleIssueEvent(
  payload: Event<"issues-opened" | "issues-edited">
) {
  if (!payload.issue.body?.includes(command)) return;
  return await processIssueOrComment(payload);
}

export function handleIssueCommentEvent(
  payload: Event<"issue-comment-created" | "issue-comment-edited">
) {
  if (!payload.comment.body?.includes(command)) return;
  return processIssueOrComment(payload);
}

async function processIssueOrComment(
  payload: Event<
    | "issues-opened"
    | "issues-edited"
    | "issue-comment-created"
    | "issue-comment-edited"
  >
) {
  debugger;
  if (!payload.installation?.id) return;

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

  console.log(branchName);
  console.log(prompt);
  // Run the task with the generated prompt
  // await run({
  //   repoUrl,
  //   prompt,
  //   branch: branchName,
  // });

  console.log(
    `Processing issue #${payload.issue.id} from ${payload.repository.full_name}`
  );
}
