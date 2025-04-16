import { createPullRequest } from "@/lib/github/pull-request";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // TODO: add hmac security
  const body = (await req.json()) satisfies {
    id: string;
    error?: string;
    output?: {
      cost_usd: number;
      duration_api_ms: number;
      duration_ms: number;
      result: string;
      role: string;
    };
  };

  const run = await prisma.run.update({
    where: { id: body.id },
    data: { output: JSON.stringify(body.output) },
  });

  const repoUrl = new URL(run.repoUrl);
  const repoOwner = repoUrl.pathname.split("/")[1];
  const repoName = repoUrl.pathname.split("/")[2];
  await createPullRequest({
    branch: run.branch,
    issueNumber: run.issueNumber,
    repoOwner,
    repoName,
    runId: run.id,
    installationId: run.installationId,
    baseRef: "main", // TODO: support other than main
    content: body.output?.result,
  });

  return NextResponse.json({ success: true });
}
