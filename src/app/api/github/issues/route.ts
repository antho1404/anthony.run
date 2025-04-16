import { getInstallationToken } from "@/lib/github";
import { auth } from "@clerk/nextjs/server";
import { Octokit } from "@octokit/core";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const searchParams = req.nextUrl.searchParams;
  const repoFullName = searchParams.get("repo");
  const installationId = searchParams.get("installationId");

  if (!repoFullName || !installationId)
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );

  const token = await getInstallationToken(Number(installationId));
  const octokit = new Octokit({ auth: token });

  const [owner, repo] = repoFullName.split("/");

  const response = await octokit.request("GET /repos/{owner}/{repo}/issues", {
    owner,
    repo,
    state: "open",
    per_page: 100,
  });

  const issues = response.data.filter((issue) => !issue.pull_request);

  return NextResponse.json({ issues });
}
