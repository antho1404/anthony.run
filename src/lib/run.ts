import { prisma } from "@/lib/prisma";
import { Run } from "@/lib/prisma/generated";

const CREATE_MACHINE_ENDPOINT =
  "https://api.machines.dev/v1/apps/anthony-run/machines";

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
          restart: {
            max_retries: 1,
            policy: "no",
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
          // auto_destroy: true,
        },
      }),
    });

    const data = await response.json();
    if (!response.ok)
      return [null, new Error(data.message || "Fly machine error")];
    return [data.id, null];
  } catch (error) {
    return [null, error];
  }
}

// async function createDockerContainer(run: Run) {
//   const docker = new Docker();

//   try {
//     const container = await docker.createContainer({
//       Image: run.image,
//       name: run.id,
//       Env: [`ANTHROPIC_API_KEY=${process.env.ANTHROPIC_API_KEY}`],
//       Cmd: [
//         run.repoUrl,
//         run.prompt,
//         run.branch,
//         new URL("/api/runner/webhook", process.env.BASE_APP_URL).toString(),
//         run.id,
//       ],
//       HostConfig: {
//         AutoRemove: true,
//       },
//     });
//     await container.start();
//     return [container.id, null];
//   } catch (error) {
//     return [null, error];
//   }
// }

async function createRunner(run: Run) {
  // if (process.env.NODE_ENV === "development")
  //   return await createDockerContainer(run);
  return await createFlyMachine(run);
}

export async function createRun({
  repoUrl,
  prompt,
  branch,
  issueNumber,
  installationId,
  userId,
}: {
  repoUrl: URL;
  prompt: string;
  branch: string;
  issueNumber: number;
  installationId: number;
  userId: string;
}) {
  const run = await prisma.run.create({
    data: {
      branch,
      prompt,
      repoUrl: repoUrl.toString(),
      issueNumber,
      installationId,
      userId,
    },
  });

  const [containerId, error] = await createRunner(run);

  return await prisma.run.update({
    where: { id: run.id },
    data: { error: error?.message, containerId },
  });
}
