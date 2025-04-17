import RunFormSkeleton from "@/app/dashboard/runs/create/form-skeleton";
import RepoIssueSelector from "@/components/repo-issue-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getAccountRepositoriesByInstallationIds } from "@/lib/github";
import { currentUser } from "@clerk/nextjs/server";
import { Suspense } from "react";

export default async function CreateRunPage() {
  const user = await currentUser();
  const installations = getAccountRepositoriesByInstallationIds(
    user?.privateMetadata.githubInstallationIds || []
  );

  return (
    <div className="max-w-2xl w-full mx-auto space-y-6 pt-12">
      <Card>
        <CardHeader>
          <CardTitle>Create New Run</CardTitle>
          <CardDescription>
            Select a repository and issue to start a new run
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Suspense fallback={<RunFormSkeleton />}>
            <RepoIssueSelector installationsPromise={installations} />
          </Suspense>
        </CardContent>
      </Card>
      <div className="flex gap-4 w-full items-center justify-center overflow-hidden">
        <Separator className="w-auto" />
        <p className="text-muted-foreground text-center">or</p>
        <Separator className="w-auto" />
      </div>

      <p className="text-center text-muted-foreground">
        Alternatively, you can mention{" "}
        <span className="font-bold">@anthony-run</span> in a comment on a GitHub
        <br />
        issue and it will automatically create a run for you.
      </p>
    </div>
  );
}
