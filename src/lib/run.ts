import { prisma } from "@/lib/prisma";
import { Run } from "@/lib/prisma/generated";
import "server-only";

async function createDockerContainer(
  run: Run
): Promise<[string, null] | [null, Error]> {
  const Docker = (await import("dockerode")).default;
  const docker = new Docker({
    protocol: "https",
    host: process.env.DOCKER_HOST,
    port: 2376,
    ca: Buffer.from(process.env.DOCKER_CA || "", "base64").toString("utf-8"),
    cert: Buffer.from(process.env.DOCKER_CERT || "", "base64").toString(
      "utf-8"
    ),
    key: Buffer.from(process.env.DOCKER_KEY || "", "base64").toString("utf-8"),
  });
  try {
    const container = await docker.createContainer({
      Image: run.image,
      name: run.id,
      Env: [`ANTHROPIC_API_KEY=${process.env.ANTHROPIC_API_KEY}`],
      Cmd: [
        run.repoUrl,
        run.prompt,
        run.branch,
        new URL("/api/runner/webhook", process.env.BASE_APP_URL).toString(),
        run.id,
      ],
      HostConfig: {
        // AutoRemove: true,
        RestartPolicy: {
          Name: "no",
        },
      },
    });
    await container.start();
    return [container.id, null];
  } catch (e) {
    return [null, e as Error];
  }
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

  const [containerId, error] = await createDockerContainer(run);

  return await prisma.run.update({
    where: { id: run.id },
    data: { error: error?.message, containerId },
  });
}
