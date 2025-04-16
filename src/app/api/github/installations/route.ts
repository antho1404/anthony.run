import { clerkClient } from "@/lib/clerk";
import { getAccountRepositoriesByInstallationIds } from "@/lib/github";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });
  const user = await clerkClient.users.getUser(userId);

  const installationIds =
    (user.privateMetadata.githubInstallationIds as number[]) || [];

  if (installationIds.length === 0) return NextResponse.json([]);

  const installationsWithRepos = await getAccountRepositoriesByInstallationIds(
    installationIds
  );

  return NextResponse.json(installationsWithRepos);
}
