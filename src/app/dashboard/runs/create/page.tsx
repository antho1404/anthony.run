import RepoIssueSelector from "@/components/repo-issue-form";
import { getAccountRepositoriesByInstallationIds } from "@/lib/github";
import { currentUser } from "@clerk/nextjs/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create run • anthony • run",
  description: "Solve an issue from GitHub",
};

export default async function CreateRunPage() {
  const user = await currentUser();
  const installations = getAccountRepositoriesByInstallationIds(
    user?.privateMetadata.githubInstallationIds || []
  );

  return <RepoIssueSelector installationsPromise={installations} />;
}
