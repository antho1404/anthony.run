import { auth } from "@clerk/nextjs/server";
import { getIssueDetails, getRepoUrl } from "@/lib/github";
import { generatePromptFromIssue } from "@/lib/prompt";
import { createRun } from "@/lib/run";
import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/core";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { repoFullName, installationId, issueNumber } = body;

    if (!repoFullName || !installationId || !issueNumber) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get repository information from GitHub API
    const token = await getInstallationToken(installationId);
    const octokit = new Octokit({ auth: token });
    const [owner, repo] = repoFullName.split("/");

    const repoResponse = await octokit.request("GET /repos/{owner}/{repo}", {
      owner,
      repo,
    });
    const repoId = repoResponse.data.id;

    // Get issue details
    const issueDetails = await getIssueDetails(
      repoId,
      issueNumber,
      installationId
    );

    if (!issueDetails) {
      return NextResponse.json(
        { error: "Failed to fetch issue details" },
        { status: 404 }
      );
    }

    // Get repository URL
    const repoUrl = await getRepoUrl(repoId, installationId);
    if (!repoUrl) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 }
      );
    }

    // Create branch name from issue title
    const branchName = `issue-${issueNumber}-${issueDetails.issue.title
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

    // Create the run
    const run = await createRun({
      repoUrl,
      prompt,
      branch: branchName,
      issueNumber,
      installationId,
      userId,
    });

    return NextResponse.json({ success: true, runId: run.id });
  } catch (error) {
    console.error("Error creating run:", error);
    return NextResponse.json(
      { error: "Failed to create run" },
      { status: 500 }
    );
  }
}

async function getInstallationToken(installationId: number) {
  // Import here to avoid circular dependency
  const { getInstallationToken } = await import("@/lib/github");
  return getInstallationToken(installationId);
}
