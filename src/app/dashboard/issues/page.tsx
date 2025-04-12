import { GitHubIssue } from "@/components/github-issue";
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
import {
  getAccountRepositoriesByInstallationId,
  getIssueDetails,
  getRepositoryIssues,
  getRepoUrl,
} from "@/lib/github";
import { run } from "@/lib/runner";
import { cn } from "@/lib/utils";
import { GitCommitVerticalIcon, PlusCircleIcon } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Project to name * Issues",
  description: "Solve issues without touching a single line of code",
};

export default async function Issues({
  searchParams,
}: {
  searchParams: Promise<{ repoId?: string }>;
}) {
  const repositoriesByInstallation =
    await getAccountRepositoriesByInstallationId();
  const params = await searchParams;
  const repoId = params.repoId ? parseInt(params.repoId) : undefined;
  const issuesData = repoId ? await getRepositoryIssues(repoId) : null;

  async function handleSelectRepo(formData: FormData) {
    "use server";
    const repoId = formData.get("repoId");
    if (!repoId) throw new Error("Invalid repo ID");

    redirect(`/dashboard/issues?repoId=${repoId}`);
  }

  async function handleRunIssue(formData: FormData) {
    "use server";
    const repoId = formData.get("repoId");
    const issueNumber = formData.get("issueNumber");
    if (!repoId) throw new Error("Invalid repo ID");
    if (!issueNumber) throw new Error("Invalid issue number");

    const issueDetails = await getIssueDetails(
      Number(repoId),
      Number(issueNumber)
    );
    if (!issueDetails) throw new Error("Could not fetch issue details");

    const repoUrl = await getRepoUrl(Number(repoId));
    if (!repoUrl) throw new Error("Invalid repo URL");

    // Create branch name from issue title
    const branchName = `issue-${issueNumber}-${issueDetails.issue.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 30)}`;

    // Generate optimized prompt from issue details
    const prompt = generatePromptFromIssue(issueDetails);

    await run({
      repoUrl: repoUrl,
      prompt,
      branch: branchName,
    });

    redirect("/dashboard");
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

        {issuesData && issuesData.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Issues from {repoId}</h3>
            <div className="grid gap-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {issuesData.map((issue: any) => (
                <form key={issue.id} action={handleRunIssue}>
                  <input
                    type="hidden"
                    name="repoId"
                    value={repoId?.toString()}
                  />
                  <input
                    type="hidden"
                    name="issueNumber"
                    value={issue.number}
                  />
                  <div className="flex items-center gap-3">
                    <GitHubIssue
                      number={issue.number}
                      title={issue.title}
                      label={getIssueLabel(issue)}
                      isOpen={issue.state === "open"}
                      comments={issue.comments}
                      createdAt={formatCreatedAt(issue.created_at)}
                      className="flex-grow cursor-pointer hover:bg-slate-50"
                    />
                    <Button type="submit" size="sm">
                      Create Branch & Solve
                    </Button>
                  </div>
                </form>
              ))}
            </div>
          </div>
        ) : issuesData ? (
          <div className="text-center py-8 text-muted-foreground">
            No open issues found in this repository.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getIssueLabel(issue: any): any {
  if (issue.labels && issue.labels.length > 0) {
    // Try to map GitHub labels to our predefined labels
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const labelMap: Record<string, any> = {
      bug: "bug",
      documentation: "documentation",
      enhancement: "feature",
      feature: "feature",
      "high-priority": "high priority",
      accessibility: "accessibility",
      testing: "testing",
      performance: "performance",
      wontfix: "wontfix",
      dependencies: "dependencies",
    };

    for (const label of issue.labels) {
      const name = label.name.toLowerCase();
      if (labelMap[name]) {
        return labelMap[name];
      }
    }

    // If there's a label but no match, use the first one
    return "feature";
  }

  // Default label if none found
  return "feature";
}

function formatCreatedAt(createdAt: string): string {
  const date = new Date(createdAt);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} ${months === 1 ? "month" : "months"} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} ${years === 1 ? "year" : "years"} ago`;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generatePromptFromIssue(issueDetails: any): string {
  const { issue, comments, repoFullName, repoOwner, repoName } = issueDetails;

  let prompt = `# GitHub Issue: ${issue.title}\n\n`;
  prompt += `Issue #${issue.number} from ${repoFullName}\n\n`;

  // Extract key information from the issue body
  const issueBody = issue.body || "";
  prompt += `## Issue Description\n\n${issueBody}\n\n`;

  // Add relevant labels as context
  if (issue.labels && issue.labels.length > 0) {
    prompt += `## Labels\n`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    issue.labels.forEach((label: any) => {
      prompt += `- ${label.name}\n`;
    });
    prompt += `\n`;
  }

  // Add comments if any, focusing on technical details
  if (comments.length > 0) {
    prompt += `## Discussion Context\n\n`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    comments.forEach((comment: any) => {
      prompt += `**@${comment.user.login}:**\n${comment.body}\n\n`;
    });
  }

  // Add specific instructions for the AI
  prompt += `\n## Task\n\n`;
  prompt += `Please solve this issue by implementing the necessary changes to the codebase. Follow these guidelines:\n\n`;
  prompt += `1. **Analyze the issue:** Understand the requirements, constraints, and underlying problems\n`;
  prompt += `2. **Explore the codebase:** Identify relevant files and components that need to be modified\n`;
  prompt += `3. **Implement a solution:** Make the minimal necessary changes to address the issue\n`;
  prompt += `4. **Follow best practices:** Ensure your code is clean, maintainable, and consistent with the project style\n`;
  prompt += `5. **Add tests if appropriate:** Cover your changes with tests when applicable\n`;

  // Add repository context
  prompt += `\n## Repository Context\n`;
  prompt += `- Owner: ${repoOwner}\n`;
  prompt += `- Repository: ${repoName}\n`;
  prompt += `- Issue URL: https://github.com/${repoFullName}/issues/${issue.number}\n\n`;

  // Add technical hints and focus areas based on issue content
  const keywords = extractKeywords(issueBody);
  if (keywords.length > 0) {
    prompt += `## Focus Areas\n`;
    prompt += `Based on the issue content, pay special attention to these aspects:\n`;
    keywords.forEach((keyword) => {
      prompt += `- ${keyword}\n`;
    });
    prompt += `\n`;
  }

  prompt += `Please provide a detailed solution that addresses all aspects of this issue. Thank you!`;

  return prompt;
}

function extractKeywords(text: string): string[] {
  if (!text) return [];

  // List of technical terms to look for in issues
  const technicalPatterns = [
    // UI/Frontend patterns
    /component/i,
    /UI/i,
    /interface/i,
    /display/i,
    /render/i,
    /style/i,
    /CSS/i,
    /responsive/i,
    /animation/i,
    /layout/i,
    /theme/i,
    /accessibility/i,
    /a11y/i,

    // Backend/data patterns
    /API/i,
    /endpoint/i,
    /database/i,
    /performance/i,
    /query/i,
    /cache/i,
    /auth[entication|orization]/i,
    /security/i,
    /data/i,
    /validation/i,

    // General development terms
    /bug/i,
    /feature/i,
    /implement/i,
    /fix/i,
    /error/i,
    /exception/i,
    /test/i,
    /documentation/i,
    /refactor/i,
    /optimize/i,
  ];

  // Extract keywords based on patterns
  const keywords = new Set<string>();

  technicalPatterns.forEach((pattern) => {
    const match = text.match(pattern);
    if (match && match[0]) {
      keywords.add(match[0]);
    }
  });

  // Also look for code fragments or technical terms wrapped in backticks
  const codeFragments = text.match(/`([^`]+)`/g);
  if (codeFragments) {
    codeFragments.forEach((fragment) => {
      const cleaned = fragment.replace(/`/g, "").trim();
      if (cleaned.length > 0) {
        keywords.add(cleaned);
      }
    });
  }

  return Array.from(keywords);
}
