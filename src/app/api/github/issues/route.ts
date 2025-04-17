import { getAccountRepositoriesByInstallationIds } from "@/lib/github";
import { getRepoIssues } from "@/lib/github/issue";
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

  const installations = await getAccountRepositoriesByInstallationIds(
    user?.privateMetadata.githubInstallationIds || []
  );
  const installation = installations.find((i) =>
    i.repositories.find((r) => r.full_name === repoFullName)
  );

  if (!installation)
    return NextResponse.json(
      { error: "Installation not found" },
      { status: 404 }
    );

  const issues = await getRepoIssues({
    installationId: installation.installationId,
    repoFullName,
  });
  return NextResponse.json({ issues });
}
