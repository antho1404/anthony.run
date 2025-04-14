import { prisma } from "@/lib/prisma";
import { Run } from "@/lib/prisma/generated";
import { execSync } from "child_process";

const CREATE_MACHINE_ENDPOINT =
  "https://api.machines.dev/v1/apps/project-to-name/machines";

async function createFlyMachine(run: Run) {
  try {
    const response = await fetch(CREATE_MACHINE_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FLY_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: run.id,
        region: run.region,
        config: {
          image: run.image,
          env: {
            ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
          },
          init: {
            cmd: [
              run.repoUrl,
              run.prompt,
              run.branch,
              new URL(
                "/api/runner/webhook",
                process.env.BASE_APP_URL
              ).toString(),
              run.id,
            ],
          },
          auto_destroy: true,
        },
        // registry: {
        //   username: "antho1404",
        //   password: process.env.GITHUB_PAT,
        //   server: "ghcr.io",
        // },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return [null, new Error(data.message || "Fly machine error")];
    }
    console.log("Monitor at https://fly.io/apps/project-to-name/monitoring");
    return [data.id, null];
  } catch (error) {
    return [null, error];
  }
}

async function createDockerContainer(run: Run) {
  try {
    const output = execSync(
      `docker run -d \
-e ANTHROPIC_API_KEY=${process.env.ANTHROPIC_API_KEY} \
claude-runner \
"${run.repoUrl}" \
"${run.prompt.replace(/[\"\$`]/g, (m) => `\\${m}`)}" \
"${run.branch}" \
"${new URL("/api/runner/webhook", process.env.BASE_APP_URL).toString()}" \
"${run.id}"`,
      { stdio: "pipe" }
    );
    return [output.toString(), null];
  } catch (error) {
    return [null, error];
  }
}

async function createRunner(run: Run) {
  if (process.env.NODE_ENV === "development")
    return await createDockerContainer(run);
  return await createFlyMachine(run);
}

export async function createRun({
  repoUrl,
  prompt,
  branch,
}: {
  repoUrl: URL;
  prompt: string;
  branch: string;
}) {
  const run = await prisma.run.create({
    data: {
      branch,
      prompt,
      repoUrl: repoUrl.toString(),
    },
  });

  const [containerId, error] = await createRunner(run);

  await prisma.run.update({
    where: { id: run.id },
    data: { error: error?.message, containerId },
  });

  return run;
}
