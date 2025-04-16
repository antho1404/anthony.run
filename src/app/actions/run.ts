"use server";
import { getAccountRepositoriesByInstallationIds } from "@/lib/github";
import { processIssueOrComment } from "@/lib/github/issue";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

export async function createRunAction({
  repoFullName,
  installationId,
  issueNumber,
}: {
  repoFullName: string;
  installationId: number;
  issueNumber: number;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [installation] = await getAccountRepositoriesByInstallationIds([
    installationId,
  ]);
  if (!installation) notFound();
  if (!installation.account) notFound();

  const repository = installation.repositories.find(
    (repo) => repo.full_name === repoFullName
  );
  if (!repository) notFound();

  const run = await processIssueOrComment({
    issue: { number: issueNumber },
    repository: { id: repository.id },
    sender: { id: installation.account.id },
    installation: { id: installationId },
  });

  redirect(`/dashboard/runs/${run.id}`);
}
