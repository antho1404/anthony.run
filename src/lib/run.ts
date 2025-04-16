import { createContainer, startContainer } from "@/lib/docker";
import { prisma } from "@/lib/prisma";
import { Run } from "@/lib/prisma/generated";
import { tryCatch } from "@/lib/tryCatch";
import { isUserSubscribed } from "./stripe/subscription";

export async function createDockerContainer(run: Run) {
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
  // Check if user is subscribed or has reached free tier limits
  const isSubscribed = await isUserSubscribed(userId);
  
  if (!isSubscribed) {
    // For free tier users, check run count
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const runCount = await prisma.run.count({
      where: {
        userId,
        createdAt: {
          gte: monthStart,
        },
      },
    });
    
    // Free tier limit (3 runs per month)
    const FREE_TIER_LIMIT = 3;
    
    if (runCount >= FREE_TIER_LIMIT) {
      throw new Error('Free tier limit reached. Please upgrade your subscription to continue.');
    }
  }
  
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
