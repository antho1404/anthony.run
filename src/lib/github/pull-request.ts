import { createPullRequest } from "./index";

export async function generatePullRequest({
  userId,
  repoFullName,
  issueNumber,
  branch,
  runId,
  content,
}: {
  userId: string;
  repoFullName: string;
  issueNumber: number;
  branch: string;
  runId: string;
  content: string;
}) {
  // Create title based on branch name (removing issue ID prefix and converting dashes to spaces)
  const title = `Fix #${issueNumber}: ${branch
    .replace(/^issue-\d+-/, "")
    .replace(/-/g, " ")}`;

  return await createPullRequest(
    userId,
    repoFullName,
    {
      title,
      body: `${content}

## Result
View the execution result: https://anthony.run/dashboard/runs/${runId}

Closes #${issueNumber}`,
      head: branch,
    },
    "bot"
  );
}
