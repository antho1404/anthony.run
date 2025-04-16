import { createContainer, startContainer } from "@/lib/docker";
import { prisma } from "@/lib/prisma";
import { Run } from "@/lib/prisma/generated";
import { tryCatch } from "@/lib/tryCatch";

export async function createDockerContainer(run: Run) {
  console.log("create docker container", run.id);
  const id = await createContainer({
    image: run.image,
    name: run.id,
    env: [`ANTHROPIC_API_KEY=${process.env.ANTHROPIC_API_KEY}`],
    cmd: [
      run.repoUrl,
      run.prompt,
      run.branch,
      new URL("/api/runner/webhook", process.env.BASE_APP_URL).toString(),
      run.id,
    ],
  });

  console.log("created docker container", id);
  console.log("start docker container");
  await startContainer(id);
  return id;
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

  const { data: containerId, error } = await tryCatch(
    createDockerContainer(run)
  );

  return await prisma.run.update({
    where: { id: run.id },
    data: { error: error?.message, containerId },
  });
}
