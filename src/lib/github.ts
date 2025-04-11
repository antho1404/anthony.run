import { createClerkClient, currentUser } from "@clerk/nextjs/server";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/core";
import { readFileSync } from "fs";

export async function generateToken() {
  const user = await currentUser();

  if (!user) throw new Error("User not authenticated");

  console.log(user.externalAccounts);
  const githubUserId = user.externalAccounts.find(
    (account) => account.provider === "oauth_github"
  )?.externalId;

  if (!githubUserId) throw new Error("GitHub account not connected");

  const appId = process.env.GITHUB_APP_ID;
  const privateKey = readFileSync("./private-key.pem", "utf8");

  if (!appId || !privateKey) {
    throw new Error("GitHub App credentials not configured");
  }

  const auth = createAppAuth({
    appId,
    privateKey,
  });

  const { token } = await auth({ type: "app" });

  const octokit = new Octokit({ auth: token });

  const { data: installations } = await octokit.request(
    "GET /app/installations"
  );

  // const response = await octokit.request('POST /app/installations/{installation_id}/access_tokens', {
  //   installation_id: installationId,
  //   headers: {
  //     'X-GitHub-Api-Version': '2022-11-28',
  //   },
  // });
  const userInstallation = installations.find(
    (installation) => installation.account?.id.toString() === githubUserId
  );

  if (!userInstallation)
    throw new Error("GitHub App not installed for this user");

  const installationAuthentication = await auth({
    type: "installation",
    installationId: userInstallation.id,
  });

  return installationAuthentication.token;
}

export async function getInstallationId(): Promise<string | null> {
  const user = await currentUser();
  const githubInstallationId = user?.privateMetadata.githubInstallationId as
    | string
    | undefined;
  return githubInstallationId ?? null;
}

// Save GitHub installation ID to user metadata
export async function saveInstallationId(
  installationId: string
): Promise<void> {
  const user = await currentUser();
  if (!user) throw new Error("User not authenticated");
  const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  await client.users.updateUserMetadata(user.id, {
    privateMetadata: {
      githubInstallationId: installationId,
    },
  });
}

export async function getUserRepositories() {
  const token = await generateToken();
  const octokit = new Octokit({ auth: token });

  const response = await octokit.request("GET /installation/repositories", {
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  return response.data.repositories;
}
