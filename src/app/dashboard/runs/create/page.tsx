import RepoIssueSelector from "@/components/repo-issue-form";
import { listRepositories } from "@/lib/github";
import { currentUser } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Create run • anthony • run",
  description: "Solve an issue from GitHub",
};

export default async function CreateRunPage() {
  const user = await currentUser();
  if (!user) notFound();
  const repoPromise = listRepositories(user.id);

  return <RepoIssueSelector repoPromise={repoPromise} />;
}
