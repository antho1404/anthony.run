import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@/lib/clerk";
import { getIssueDetails, getInstallationToken } from "@/lib/github";
import { Octokit } from "@octokit/core";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Get query parameters
  const searchParams = req.nextUrl.searchParams;
  const repoFullName = searchParams.get("repo");
  const installationId = searchParams.get("installationId");

  if (!repoFullName || !installationId) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  try {
    // Get installation token
    const token = await getInstallationToken(Number(installationId));
    const octokit = new Octokit({ auth: token });

    // Extract owner and repo from full name
    const [owner, repo] = repoFullName.split("/");

    // Fetch open issues
    const response = await octokit.request("GET /repos/{owner}/{repo}/issues", {
      owner,
      repo,
      state: "open",
      per_page: 100,
    });

    // Filter out pull requests (which are also returned by the issues API)
    const issues = response.data.filter(issue => !issue.pull_request);

    return NextResponse.json({ issues });
  } catch (error) {
    console.error("Error fetching issues:", error);
    return NextResponse.json(
      { error: "Failed to fetch issues" },
      { status: 500 }
    );
  }
}
