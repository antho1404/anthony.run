import { tryCatch } from "@/lib/tryCatch";
import { Octokit } from "@octokit/core";
import { getInstallationToken } from "./index";

export async function createPullRequest({
  installationId,
  issueNumber,
  repoOwner,
  repoName,
  branch,
  baseRef = "main",
  runId,
  content,
}: {
  installationId: number;
  issueNumber: number;
  repoOwner: string;
  repoName: string;
  branch: string;
  baseRef?: string;
  runId: string;
  content: string;
}) {
  const token = await getInstallationToken(installationId);
  const octokit = new Octokit({ auth: token });

  // Create title based on branch name (removing issue ID prefix and converting dashes to spaces)
  const title = `Fix #${issueNumber}: ${branch
    .replace(/^issue-\d+-/, "")
    .replace(/-/g, " ")}`;

  // Create PR with detailed description
  const response = await octokit.request("POST /repos/{owner}/{repo}/pulls", {
    owner: repoOwner,
    repo: repoName,
    title,
    head: branch,
    base: baseRef,
    body: `${content}

## Result
View the execution result: https://anthony.run/dashboard/runs/${runId}

Closes #${issueNumber}`,
    draft: false,
    maintainer_can_modify: true,
  });

  // Try to assign the PR to the repo owner
  await tryCatch(
    octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/assignees",
      {
        owner: repoOwner,
        repo: repoName,
        issue_number: response.data.number,
        assignees: [repoOwner],
      }
    )
  );

  return response.data;
}
