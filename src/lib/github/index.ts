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

export async function findUserByGithubId(githubUserId: string | number) {
  const users = await clerkClient.users.getUserList({
    externalId: [githubUserId.toString()],
    limit: 1,
  });
  return users.data.length > 0 ? users.data[0] : null;
}

export async function getInstallationToken(installationId: number) {
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

export async function getAccountRepositoriesByInstallationIds(
  installationIds: number[]
) {
  const { token } = await appAuth({ type: "app" });
  const app = new Octokit({ auth: token });
  return await Promise.all(
    installationIds.map(async (installationId) => {
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
    })
  );
}

export async function getRepoUrl(repoId: number, installationId: number) {
  const items = await getAccountRepositoriesByInstallationIds([installationId]);
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

export async function getIssueDetails(
  repoId: number,
  issueNumber: number,
  installationId: number
) {
  const items = await getAccountRepositoriesByInstallationIds([installationId]);
  const item = items.find(({ repositories }) =>
    repositories.find((repo) => repo.id === repoId)
  );
  if (!item) return null;
  const repo = item.repositories.find((repo) => repo.id === repoId);
  if (!repo) return null;

  const token = await getInstallationToken(item.installationId);
  const octokit = new Octokit({ auth: token });

  const issueResponse = await octokit.request(
    "GET /repos/{owner}/{repo}/issues/{issue_number}",
    {
      owner: repo.owner.login,
      repo: repo.name,
      issue_number: issueNumber,
    }
  );

  const commentsResponse = await octokit.request(
    "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
    {
      owner: repo.owner.login,
      repo: repo.name,
      issue_number: issueNumber,
    }
  );

  return {
    issue: issueResponse.data,
    comments: commentsResponse.data,
    repoFullName: repo.full_name,
    repoOwner: repo.owner.login,
    repoName: repo.name,
  };
}

// Find repository and installation details by repository ID
export async function findRepositoryByID(repositoryId: number) {
  const { token } = await appAuth({ type: "app" });
  const app = new Octokit({ auth: token });

  // Get all installations
  const installations = await app.request("GET /app/installations");

  // Check each installation for the repository
  for (const installation of installations.data) {
    try {
      // Get installation token
      const installationToken = await getInstallationToken(installation.id);
      const octokit = new Octokit({ auth: installationToken });

      // Get repositories for this installation
      const response = await octokit.request("GET /installation/repositories");

      // Find repository by ID
      const repository = response.data.repositories.find(
        (repo) => repo.id === repositoryId
      );

      if (repository) {
        return {
          repository,
          installationId: installation.id,
          account: installation.account,
        };
      }
    } catch (error) {
      console.error(
        `Error fetching repositories for installation ${installation.id}:`,
        error
      );
    }
  }

  return null;
}
