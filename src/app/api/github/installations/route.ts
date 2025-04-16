import { auth } from "@clerk/nextjs/server";
import { getAccountRepositoriesByInstallationIds } from "@/lib/github";
import { clerkClient } from "@/lib/clerk";
import { NextRequest, NextResponse } from "next/server";

// Fetch all installations and repositories for the authenticated user
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Get user from Clerk
    const user = await clerkClient.users.getUser(userId);
    
    // Get GitHub installation IDs from the user's private metadata
    const installationIds = user.privateMetadata.githubInstallationIds as number[] || [];
    
    if (installationIds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch repositories for each installation
    const installationsWithRepos = await getAccountRepositoriesByInstallationIds(installationIds);
    
    return NextResponse.json(installationsWithRepos);
  } catch (error) {
    console.error("Error fetching installations:", error);
    return NextResponse.json(
      { error: "Failed to fetch installations" },
      { status: 500 }
    );
  }
}
