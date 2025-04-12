import { clerkClient } from "@/lib/clerk";
import { currentUser } from "@clerk/nextjs/server";
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

async function findUserByGithubId(githubUserId: string | number) {
  const users = await clerkClient.users.getUserList({
    externalId: [githubUserId.toString()],
    limit: 1,
  });
  return users.data.length > 0 ? users.data[0] : null;
}

async function getInstallationToken(installationId: number) {
  return (await appAuth({ type: "installation", installationId })).token;
}

export async function addInstallation(
  githubUserId: number,
  installationId: number
): Promise<void> {
  const user = await findUserByGithubId(githubUserId);
  if (!user) return;
  await clerkClient.users.updateUserMetadata(user.id, {
    privateMetadata: {
      githubInstallationIds: [
        ...(user.privateMetadata.githubInstallationIds ?? []),
        installationId,
      ].filter((value, index, self) => self.indexOf(value) === index),
    },
  });
}

export async function removeInstallation(
  githubUserId: number,
  installationId: number
): Promise<void> {
  const user = await findUserByGithubId(githubUserId);
  if (!user) return;
  await clerkClient.users.updateUserMetadata(user.id, {
    privateMetadata: {
      githubInstallationIds: (
        user.privateMetadata.githubInstallationIds ?? []
      ).filter((id) => id !== installationId),
    },
  });
}

export async function getAccountRepositoriesByInstallationId() {
  const user = await currentUser();
  const { token } = await appAuth({ type: "app" });
  const app = new Octokit({ auth: token });
  return await Promise.all(
    (user?.privateMetadata.githubInstallationIds || []).map(
      async (installationId) => {
        const token = await getInstallationToken(installationId);
        const user = new Octokit({ auth: token });
        const response = await user.request("GET /installation/repositories");
        const installation = await app.request(
          "GET /app/installations/{installation_id}",
          { installation_id: installationId }
        );
        return {
          installationId,
          account: installation.data.account,
          repositories: response.data.repositories,
        };
      }
    )
  );
}

export async function getRepoUrl(repoId: number) {
  const items = await getAccountRepositoriesByInstallationId();
  const item = items.find(({ repositories }) =>
    repositories.find((repo) => repo.id === repoId)
  );
  if (!item) return null;
  const repo = item.repositories.find((repo) => repo.id === repoId);
  if (!repo) return null;
  const url = new URL(repo.html_url);
  if (!repo.private) return url;
  url.username = "x-access-token";
  url.password = await getInstallationToken(item.installationId);
  return url;
}

export type GitHubIssue = {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
  created_at: string;
  updated_at: string;
  body: string;
  user: {
    login: string;
    avatar_url: string;
  };
  repository: {
    id: number;
    full_name: string;
  };
};

export async function getAllIssues(): Promise<GitHubIssue[]> {
  const installations = await getAccountRepositoriesByInstallationId();

  const allIssues: GitHubIssue[] = [];

  for (const { installationId, repositories } of installations) {
    const token = await getInstallationToken(installationId);
    const octokit = new Octokit({ auth: token });

    for (const repo of repositories) {
      try {
        const response = await octokit.request(
          "GET /repos/{owner}/{repo}/issues",
          {
            owner: repo.owner.login,
            repo: repo.name,
            state: "open",
            per_page: 100,
          }
        );

        // Add repository information to each issue and filter out pull requests
        const issues = response.data
          .filter((issue) => !issue.pull_request)
          .map((issue) => ({
            ...issue,
            repository: {
              id: repo.id,
              full_name: repo.full_name,
            },
          })) as GitHubIssue[];

        allIssues.push(...issues);
      } catch (error) {
        console.error(`Error fetching issues for ${repo.full_name}:`, error);
      }
    }
  }
  return allIssues;
}
