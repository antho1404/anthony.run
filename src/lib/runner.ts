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
            GITHUB_TOKEN: await getGitHubToken(installationId),
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

  // Create a PR after execution is completed
  try {
    // We'll check for completion in a separate function
    await monitorAndCreatePR({
      machineId,
      issueNumber,
      repoOwner,
      repoName,
      branch,
      installationId,
    });
  } catch (error) {
    console.error("Error creating PR after execution:", error);
    // Don't fail the overall process if PR creation fails
  }

  return {
    machineId,
    status: data.state,
    createdAt: data.created_at,
  };
}

async function getGitHubToken(installationId: number): Promise<string> {
  // Import here to avoid circular dependency
  const { getInstallationToken } = await import("./github");
  return getInstallationToken(installationId);
}

async function monitorAndCreatePR({
  machineId,
  issueNumber,
  repoOwner,
  repoName,
  branch,
  installationId,
}: {
  machineId: string;
  issueNumber: number;
  repoOwner: string;
  repoName: string;
  branch: string;
  installationId: number;
}) {
  // Wait some time for the machine to complete its work
  // In a production system, you might want to implement a proper polling mechanism
  // or use webhooks from Fly.io to know when the machine is done
  await new Promise((resolve) => setTimeout(resolve, 60000)); // Wait 60 seconds

  try {
    // Check machine status
    const response = await fetch(
      `https://api.machines.dev/v1/apps/project-to-name/machines/${machineId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLY_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to check machine status");
    }

    const machineData = await response.json();
    
    // If the machine is still running, we can continue waiting or schedule a follow-up check
    if (machineData.state === "started") {
      console.log("Machine still running, scheduling another check");
      // Schedule another check after some time
      setTimeout(() => {
        monitorAndCreatePR({
          machineId,
          issueNumber,
          repoOwner,
          repoName,
          branch,
          installationId,
        }).catch(console.error);
      }, 30000); // Check again in 30 seconds
      return;
    }

    // Import PR creation functionality
    const { createPullRequest, getCommitsForBranch } = await import("./github/pull-request");

    // Get commits for the branch
    const commits = await getCommitsForBranch({
      installationId,
      repoOwner,
      repoName,
      branch,
    });

    // Create the PR
    await createPullRequest({
      installationId,
      issueNumber,
      repoOwner,
      repoName,
      branch,
      baseRef: "main", // Default base branch
      commits,
      executionId: machineId,
    });

    console.log(`PR created successfully for issue #${issueNumber}`);
  } catch (error) {
    console.error("Error monitoring machine or creating PR:", error);
    throw error;
  }
}
