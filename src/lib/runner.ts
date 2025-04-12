export async function run({
  repoUrl,
  prompt,
  branch,
}: {
  repoUrl: URL;
  prompt: string;
  branch: string;
}) {
  const machineName = `repo-${
    repoUrl.pathname
  }-${branch}-${new Date().getTime()}`;
  const response = await fetch(
    "https://api.machines.dev/v1/apps/project-to-name/machines",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLY_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: machineName,
        region: "sin",
        config: {
          image: "ghcr.io/antho1404/claude-runner:latest",
          env: {
            ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
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

  if (!response.ok) throw new Error(data.message || "Fly machine error");

  return {
    ...data,
    repository: repoUrl.pathname.substring(1), // Remove leading slash
    branch,
  };
}

export async function getExecutionHistory() {
  const response = await fetch(
    "https://api.machines.dev/v1/apps/project-to-name/machines",
    { headers: { Authorization: `Bearer ${process.env.FLY_API_TOKEN}` } }
  );

  if (!response.ok) throw new Error("Failed to fetch machine history");

  const machines = await response.json();

  // Extract and format execution data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return machines.map((machine: any) => {
    const { repository, branch } = extractInfoFromMachineName(machine.name);

    return {
      ...machine,
      repository,
      branch,
    };
  });
}

function extractInfoFromMachineName(name: string) {
  // Default values
  let repository = "unknown";
  let branch = "unknown";

  if (name && name.startsWith("repo-")) {
    const parts = name.split("-");
    // Extract branch (second-to-last part)
    branch = parts.pop() || "unknown";
    // Remove "repo-" prefix
    parts.shift();
    // Remaining parts form the repository path
    repository = parts.join("/");
  }

  return { repository, branch };
}

export async function getMachineStatus(machineId: string) {
  const response = await fetch(
    `https://api.machines.dev/v1/apps/project-to-name/machines/${machineId}`,
    { headers: { Authorization: `Bearer ${process.env.FLY_API_TOKEN}` } }
  );

  if (!response.ok) throw new Error("Failed to fetch machine status");

  const data = await response.json();
  return {
    ...data,
    events: await getMachineEvents(machineId),
  };
}

export async function getMachineEvents(machineId: string) {
  const response = await fetch(
    `https://api.machines.dev/v1/apps/project-to-name/machines/${machineId}/events`,
    { headers: { Authorization: `Bearer ${process.env.FLY_API_TOKEN}` } }
  );

  if (!response.ok) throw new Error("Failed to fetch machine events");

  return await response.json();
}
