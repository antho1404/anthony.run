import { Octokit } from "@octokit/core";
import { getInstallationToken } from "./index";

export interface PRDetails {
  issueNumber: number;
  repoOwner: string;
  repoName: string;
  branch: string;
  baseRef: string;
  executionId: string;
}

export async function createPullRequest({
  installationId,
  issueNumber,
  repoOwner,
  repoName,
  branch,
  baseRef = "main",
  executionId,
}: PRDetails & { installationId: number }) {
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
    body: `## Summary
This PR addresses issue #${issueNumber}.

## Result
View the execution result: https://project-to-name.com/dashboard/execution/${executionId}

Closes #${issueNumber}`,
    draft: false,
    maintainer_can_modify: true,
  });

  // Try to assign the PR to the repo owner
  try {
    await octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/assignees",
      {
        owner: repoOwner,
        repo: repoName,
        issue_number: response.data.number,
        assignees: [repoOwner],
      }
    );
  } catch (error) {
    console.error("Failed to assign PR:", error);
    // Continue even if assignment fails
  }

  return response.data;
}
