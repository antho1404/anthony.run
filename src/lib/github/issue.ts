import {
  findUserByGithubId,
  getInstallationToken,
  getIssueDetails,
  getRepoUrl,
} from "@/lib/github";
import { Event } from "@/lib/github/type";
import { generatePromptFromIssue } from "@/lib/prompt";
import { createRun } from "@/lib/run";
import { Octokit } from "@octokit/core";
import { invariant } from "ts-invariant";

// @anthony-run, @anthony.run, @anthony•run
const commandRegex = /@anthony[-\.•]run/;

export async function handleIssueEvent(
  payload: Event<"issues-opened" | "issues-edited">
) {
  if (!canProcessIssue(payload)) return;
  if (!payload.issue.body?.match(commandRegex)) return;
  return await processIssueOrComment(payload);
}

export async function handleIssueCommentEvent(
  payload: Event<"issue-comment-created" | "issue-comment-edited">
) {
  if (!canProcessIssue(payload)) return;
  if (!payload.comment.body?.match(commandRegex)) return;
  return await processIssueOrComment(payload);
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

export async function processIssueOrComment(payload: {
  issue: { number: number };
  repository: { id: number };
  installation?: { id: number };
  sender: { id: number };
}) {
  invariant(payload.installation);

  const user = await findUserByGithubId(payload.sender.id);
  if (!user) throw new Error("User not found");

  const issueDetails = await getIssueDetails(
    payload.repository.id,
    payload.issue.number,
    payload.installation.id
  );
  if (!issueDetails) throw new Error("Issue not found");

  const repoUrl = await getRepoUrl(
    payload.repository.id,
    payload.installation.id
  );
  if (!repoUrl) throw new Error("Repository not found");

  // Create branch name from issue title
  const branchName = `issue-${payload.issue.number}-${issueDetails.issue.title
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

  // Run the task with the generated prompt
  const run = await createRun({
    repoUrl,
    prompt,
    branch: branchName,
    issueNumber: payload.issue.number,
    installationId: payload.installation.id,
    userId: user?.id,
  });

  return run;
}

export async function getRepoIssues({
  installationId,
  repoFullName,
}: {
  installationId: number;
  repoFullName: string;
}) {
  const token = await getInstallationToken(Number(installationId));
  const octokit = new Octokit({ auth: token });

  const [owner, repo] = repoFullName.split("/");

  const response = await octokit.request("GET /repos/{owner}/{repo}/issues", {
    owner,
    repo,
    state: "open",
    per_page: 100,
  });

  return response.data.filter((issue) => !issue.pull_request);
}
