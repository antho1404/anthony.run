import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAccountRepositoriesByInstallationIds } from "@/lib/github";
import { cn } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { GitCommitVerticalIcon, PlusCircleIcon } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Issues • anthony • run",
  description: "Solve issues without touching a single line of code",
};

export default async function Issues({
  searchParams,
}: {
  searchParams: Promise<{ repoId?: string }>;
}) {
  const user = await currentUser();
  const repositoriesByInstallation =
    await getAccountRepositoriesByInstallationIds(
      user?.privateMetadata.githubInstallationIds ?? []
    );
  const params = await searchParams;
  const repoId = params.repoId ? parseInt(params.repoId) : undefined;

  async function handleSelectRepo(formData: FormData) {
    "use server";
    const repoId = formData.get("repoId");
    if (!repoId) throw new Error("Invalid repo ID");

    redirect(`/dashboard/issues?repoId=${repoId}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>GitHub Issues</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form action={handleSelectRepo}>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Select name="repoId" defaultValue={repoId?.toString()}>
                <SelectTrigger id="repoId" className="w-full">
                  <SelectValue placeholder="Select a repository" />
                </SelectTrigger>
                <SelectContent>
                  {repositoriesByInstallation.map(
                    ({ account, repositories }, i) => (
                      <SelectGroup key={i}>
                        {account ? (
                          <SelectLabel className="flex items-center gap-2">
                            <Image
                              src={account.avatar_url}
                              alt={account.id.toString()}
                              width={24}
                              height={24}
                              className={cn(
                                "size-4",
                                "type" in account && account.type === "User"
                                  ? "rounded-full"
                                  : "rounded-xs"
                              )}
                            />{" "}
                            {"login" in account ? account.login : account.name}
                          </SelectLabel>
                        ) : (
                          <SelectLabel>n/a</SelectLabel>
                        )}

                        {repositories.map((repo) => (
                          <SelectItem key={repo.id} value={repo.id.toString()}>
                            <GitCommitVerticalIcon className="size-3" />
                            {repo.full_name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )
                  )}
                </SelectContent>
              </Select>
              <Button type="submit">View Issues</Button>
              <Button variant="outline" asChild>
                <a
                  href={`https://github.com/apps/${
                    process.env.GITHUB_APP_NAME || ""
                  }/installations/select_target`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <PlusCircleIcon className="size-4" />
                  Add GitHub account
                </a>
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
