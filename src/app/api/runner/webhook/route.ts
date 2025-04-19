import { generatePullRequest } from "@/lib/github/pull-request";
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

  if (body.error) {
    await prisma.run.update({
      where: { id: body.id },
      data: { error: body.error },
    });
    return NextResponse.json({ success: true });
  }
  const run = await prisma.run.update({
    where: { id: body.id },
    data: { output: JSON.stringify(body.output) },
  });

  const repoUrl = new URL(run.repoUrl);
  await generatePullRequest({
    userId: run.userId,
    repoFullName: repoUrl.pathname.slice(1),
    issueNumber: run.issueNumber,
    branch: run.branch,
    runId: run.id,
    content: body.output?.result,
  });

  return NextResponse.json({ success: true });
}
