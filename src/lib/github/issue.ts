import {
  findUserByGithubId,
  getIssue,
  getRepoUrl,
  listComments,
} from "@/lib/github";
import { Event } from "@/lib/github/type";
import { generatePromptFromIssue } from "@/lib/prompt";
import { createRun } from "@/lib/run";

// @anthony-run, @anthony.run, @anthony•run
const commandRegex = /@anthony[-\.•]run/;

export async function handleIssueEvent(
  payload: Event<"issues-opened" | "issues-edited">
) {
  if (!canProcessIssue(payload)) return;
  if (!payload.issue.body?.match(commandRegex)) return;
  const user = await findUserByGithubId(payload.sender.id);
  if (!user) return;
  return await processIssueOrComment(
    user.id,
    payload.repository.full_name,
    payload.issue.number
  );
}

export async function handleIssueCommentEvent(
  payload: Event<"issue-comment-created" | "issue-comment-edited">
) {
  if (!canProcessIssue(payload)) return;
  if (!payload.comment.body?.match(commandRegex)) return;
  const user = await findUserByGithubId(payload.sender.id);
  if (!user) return;
  return await processIssueOrComment(
    user.id,
    payload.repository.full_name,
    payload.issue.number
  );
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

export async function processIssueOrComment(
  userId: string,
  repoFullName: string,
  issueNumber: number
) {
  const [issue, comments] = await Promise.all([
    getIssue(userId, repoFullName, issueNumber),
    listComments(userId, repoFullName, issueNumber),
  ]);
  if (!issue) throw new Error("Issue not found");
  if (!comments) throw new Error("Comments not found");

  const repoUrl = await getRepoUrl(userId, repoFullName);
  if (!repoUrl) throw new Error("Repository not found");

  // Create branch name from issue title
  const branchName = `issue-${issueNumber}-${issue.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 30)}`;

  // Generate prompt from issue details
  const prompt = generatePromptFromIssue(issue, comments, repoFullName);

  // Run the task with the generated prompt
  const run = await createRun({
    repoUrl,
    prompt,
    branch: branchName,
    issueNumber: issue.number,
    installationId: 0,
    userId,
  });

  return run;
}
