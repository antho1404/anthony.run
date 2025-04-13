import { getInstallationToken } from "@/lib/github";

export async function run({
  repoUrl,
  prompt,
  branch,
  issueNumber,
  repoOwner,
  repoName,
  installationId,
}: {
  repoUrl: URL;
  prompt: string;
  branch: string;
  issueNumber: number;
  repoOwner: string;
  repoName: string;
  installationId: number;
}) {
  const response = await fetch(
    "https://api.machines.dev/v1/apps/project-to-name/machines",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLY_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `repo-${repoUrl.pathname}-${branch}-${new Date()}`,
        region: "sin",
        config: {
          image: "ghcr.io/antho1404/claude-runner:latest",
          env: {
            ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
            GITHUB_TOKEN: await getInstallationToken(installationId),
            REPO_OWNER: repoOwner,
            REPO_NAME: repoName,
            ISSUE_NUMBER: issueNumber.toString(),
            BRANCH_NAME: branch,
          },
          init: {
            cmd: [repoUrl.toString(), prompt, branch],
          },
          auto_destroy: true,
        },
        // registry: {
        //   username: "antho1404",
        //   password: process.env.GITHUB_PAT,
        //   server: "ghcr.io",
        // },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Failed to start machine:", data);
    throw new Error(data.message || "Fly machine error");
  }

  const machineId = data.id;

  return {
    machineId,
    status: data.state,
    createdAt: data.created_at,
  };
}
