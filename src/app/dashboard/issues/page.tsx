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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  getAccountRepositoriesByInstallationId,
  getAllIssues,
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

  const issues = await getAllIssues();

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
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>All Repository Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>
              A list of all issues from your GitHub repositories.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Repository</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No issues found. Make sure you have connected your GitHub
                    repositories.
                  </TableCell>
                </TableRow>
              ) : (
                issues.map((issue) => (
                  <TableRow key={issue.id}>
                    <TableCell className="font-medium">
                      {issue.repository.full_name}
                    </TableCell>
                    <TableCell>
                      <a
                        href={issue.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        #{issue.number} {issue.title}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          issue.state === "open"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        )}
                      >
                        {issue.state}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(issue.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => {
                          // Populate the form with issue details
                          const form =
                            document.getElementById("run-prompt-form");
                          if (form) {
                            const repoIdSelect =
                              form.querySelector('[name="repoId"]');
                            const promptTextarea =
                              form.querySelector('[name="prompt"]');

                            if (repoIdSelect) {
                              // @ts-ignore - setting value on HTMLSelectElement
                              repoIdSelect.value =
                                issue.repository.id.toString();
                            }

                            if (promptTextarea) {
                              // @ts-ignore - setting value on HTMLTextAreaElement
                              promptTextarea.value = `Fix issue #${issue.number}: ${issue.title}\n\n${issue.body}`;
                            }

                            // Scroll to the form
                            form.scrollIntoView({ behavior: "smooth" });
                          }
                        }}
                      >
                        Solve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Run Prompt on Repository</CardTitle>
        </CardHeader>
        <form action={handleRunPrompt} id="run-prompt-form">
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
                              {"login" in account
                                ? account.login
                                : account.name}
                            </SelectLabel>
                          ) : (
                            <SelectLabel>n/a</SelectLabel>
                          )}

                          {repositories.map((repo) => (
                            <SelectItem
                              key={repo.id}
                              value={repo.id.toString()}
                            >
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

            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input
                type="text"
                id="branch"
                name="branch"
                placeholder="main"
                defaultValue="fix-issue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                name="prompt"
                rows={5}
                placeholder="Enter your prompt or select an issue from the table above..."
              />
            </div>
            <Button type="submit" className="w-full">
              Run Prompt
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
