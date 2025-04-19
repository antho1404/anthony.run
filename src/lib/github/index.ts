import { clerkClient } from "@/lib/clerk";
import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/core";

const privateKey = Buffer.from(
  process.env.GITHUB_PRIVATE_KEY_B64 || "",
  "base64"
).toString("utf-8");
const appAuth = createAppAuth({
  appId: Number(process.env.GITHUB_APP_ID!),
  privateKey: privateKey,
});

async function getUserAuthAccessToken(userId: string) {
  const tokens = await clerkClient.users.getUserOauthAccessToken(
    userId,
    "github"
  );
  return tokens.data[0]?.token || null;
}

async function getInstallationToken(installationId: number) {
  const auth = await appAuth({
    type: "installation",
    installationId,
  });
  return auth.token;
}

async function userClient(userId: string) {
  const token = await getUserAuthAccessToken(userId);
  if (!token) return null;
  return new Octokit({ auth: token });
}

async function installationClient(installationId: number) {
  const token = await getInstallationToken(installationId);
  return new Octokit({ auth: token });
}

async function listInstallations(userId: string) {
  const octokit = await userClient(userId);
  if (!octokit) return null;
  const { data } = await octokit.request("GET /user/installations");
  return data.installations;
}

async function getInstallation(userId: string, repoFullName: string) {
  const installations = await listInstallations(userId);
  if (!installations) return null;
  for (const installation of installations) {
    const client = await installationClient(installation.id);
    if (!client) continue;
    const { data } = await client.request("GET /installation/repositories");
    const repo = data.repositories.find(
      (repo) => repo.full_name === repoFullName
    );
    if (repo) return installation;
  }
  return null;
}

export async function findUserByGithubId(githubUserId: string | number) {
  const users = await clerkClient.users.getUserList({
    externalId: [githubUserId.toString()],
    limit: 1,
  });
  return users.data.length > 0 ? users.data[0] : null;
}

export async function listRepositories(userId: string) {
  const installations = await listInstallations(userId);
  if (!installations) return [];
  const repoByInstallation = await Promise.all(
    installations.map(async (installation) => {
      const client = await installationClient(installation.id);
      if (!client) return null;
      const response = await client.request("GET /installation/repositories");
      return response.data.repositories;
    })
  );
  return repoByInstallation.flat().filter((x) => x !== null);
}

export async function getRepoUrl(userId: string, repoFullName: string) {
  const installations = await listInstallations(userId);
  if (!installations) return null;

  for (const installation of installations) {
    const client = await installationClient(installation.id);
    if (!client) continue;
    const { data } = await client.request("GET /installation/repositories");
    const repo = data.repositories.find(
      (repo) => repo.full_name === repoFullName
    );
    if (repo) {
      const url = new URL(repo.html_url);
      url.username = "x-access-token";
      url.password = await getInstallationToken(installation.id);
      return url;
    }
  }
  return null;
}

export async function listIssues(userId: string, repoFullName: string) {
  const client = await userClient(userId);
  if (!client) return null;

  const [owner, repo] = repoFullName.split("/");

  const response = await client.request("GET /repos/{owner}/{repo}/issues", {
    owner,
    repo,
    state: "open",
    per_page: 100,
  });

  return response.data.filter((issue) => !issue.pull_request);
}

export async function getIssue(
  userId: string,
  repoFullName: string,
  issueNumber: number
) {
  const client = await userClient(userId);
  if (!client) return null;

  const [owner, repo] = repoFullName.split("/");
  const { data } = await client.request(
    "GET /repos/{owner}/{repo}/issues/{issue_number}",
    { owner, repo, issue_number: issueNumber }
  );
  return data;
}

export async function listComments(
  userId: string,
  repoFullName: string,
  issueNumber: number
) {
  const client = await userClient(userId);
  if (!client) return null;

  const [owner, repo] = repoFullName.split("/");
  const { data } = await client.request(
    "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
    { owner, repo, issue_number: issueNumber }
  );
  return data;
}

export async function createPullRequest(
  userId: string,
  repoFullName: string,
  data: {
    title: string;
    body: string;
    head: string;
  },
  as: "user" | "bot"
) {
  let client: Octokit | null = null;
  if (as === "user") {
    client = await userClient(userId);
  }
  if (as === "bot") {
    const installation = await getInstallation(userId, repoFullName);
    if (!installation) return null;
    client = await installationClient(installation.id);
  }
  if (!client) return null;
  const [owner, repo] = repoFullName.split("/");
  const response = await client.request("POST /repos/{owner}/{repo}/pulls", {
    owner,
    repo,
    draft: false,
    maintainer_can_modify: true,
    base: "main",
    ...data,
  });
  return response.data;
}
