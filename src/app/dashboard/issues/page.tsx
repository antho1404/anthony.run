import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getAccountRepositoriesByInstallationId,
  getRepoUrl,
} from "@/lib/github";
import { run } from "@/lib/runner";
import { cn } from "@/lib/utils";
import { GitCommitVerticalIcon, PlusCircleIcon } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Project to name * Issues",
  description: "Solve issues without touching a single line of code",
};

export default async function Issues() {
  const repositoriesByInstallation =
    await getAccountRepositoriesByInstallationId();

  async function handleRunPrompt(formData: FormData) {
    "use server";
    const repoId = formData.get("repoId");
    const prompt = formData.get("prompt");
    const branch = formData.get("branch");
    if (!repoId) throw new Error("Invalid repo ID");
    if (!prompt) throw new Error("Invalid prompt");
    if (!branch) throw new Error("Invalid branch");

    const repoUrl = await getRepoUrl(Number(repoId));
    if (!repoUrl) throw new Error("Invalid repo URL");

    await run({
      repoUrl: repoUrl,
      prompt: prompt.toString(),
      branch: branch.toString(),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Run Prompt on Repository</CardTitle>
      </CardHeader>
      <form action={handleRunPrompt}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repoId">Repository</Label>
            <div className="flex gap-2">
              <Select name="repoId">
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
              <Button variant="outline" asChild>
                <a
                  href="https://github.com/apps/project-to-name/installations/select_target"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <PlusCircleIcon className="size-4" />
                  Add GitHub account
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch">Branch</Label>
            <Input
              type="text"
              id="branch"
              name="branch"
              placeholder="main"
              defaultValue="new-cards"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              name="prompt"
              rows={5}
              placeholder="Enter your prompt..."
              defaultValue="add more github card in the home page"
            />
          </div>
          <Button type="submit" className="w-full">
            Run Prompt
          </Button>
        </CardContent>
      </form>
    </Card>
  );
}
