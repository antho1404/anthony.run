export async function run({
  repoUrl,
  prompt,
  branch,
}: {
  repoUrl: URL;
  prompt: string;
  branch: string;
}) {
  const machineName = `repo-${repoUrl.pathname}-${branch}-${new Date().getTime()}`;
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

  if (!response.ok) {
    console.error("Failed to start machine:", data);
    throw new Error(data.message || "Fly machine error");
  }

  return {
    machineId: data.id,
    machineName,
    repository: repoUrl.pathname.substring(1), // Remove leading slash
    prompt,
    branch,
    status: data.state,
    createdAt: data.created_at,
  };
}

export async function getExecutionHistory() {
  try {
    const response = await fetch(
      "https://api.machines.dev/v1/apps/project-to-name/machines",
      {
        headers: {
          Authorization: `Bearer ${process.env.FLY_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch machine history");
    }

    const machines = await response.json();
    
    // Extract and format execution data
    return machines.map(machine => {
      const { repository, branch } = extractInfoFromMachineName(machine.name);
      
      return {
        machineId: machine.id,
        machineName: machine.name,
        repository,
        branch,
        status: machine.state,
        createdAt: machine.created_at,
        updatedAt: machine.updated_at,
      };
    });
  } catch (error) {
    console.error("Error fetching execution history:", error);
    return [];
  }
}

function extractInfoFromMachineName(name) {
  // Default values
  let repository = "unknown";
  let branch = "unknown";
  
  if (name && name.startsWith("repo-")) {
    try {
      const parts = name.split("-");
      
      // Extract timestamp (last part)
      const timestamp = parts.pop();
      
      // Extract branch (second-to-last part)
      branch = parts.pop() || "unknown";
      
      // Remove "repo-" prefix
      parts.shift();
      
      // Remaining parts form the repository path
      repository = parts.join("/");
    } catch (error) {
      console.error("Error parsing machine name:", error);
    }
  }
  
  return { repository, branch };
}

export async function getMachineStatus(machineId: string) {
  try {
    const response = await fetch(
      `https://api.machines.dev/v1/apps/project-to-name/machines/${machineId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLY_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch machine status");
    }

    const data = await response.json();
    return {
      machineId: data.id,
      machineName: data.name,
      status: data.state,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      region: data.region,
      config: data.config,
      events: await getMachineEvents(machineId),
    };
  } catch (error) {
    console.error("Error fetching machine status:", error);
    return null;
  }
}

export async function getMachineEvents(machineId: string) {
  try {
    const response = await fetch(
      `https://api.machines.dev/v1/apps/project-to-name/machines/${machineId}/events`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLY_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch machine events");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching machine events:", error);
    return [];
  }
}
