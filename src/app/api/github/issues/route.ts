import { listIssues } from "@/lib/github";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const searchParams = req.nextUrl.searchParams;
  const repoFullName = searchParams.get("repo");

  if (!repoFullName)
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );

  const issues = await listIssues(user.id, repoFullName);
  return NextResponse.json({ issues });
}
