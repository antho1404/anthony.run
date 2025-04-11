import { currentUser } from "@clerk/nextjs/server";
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
