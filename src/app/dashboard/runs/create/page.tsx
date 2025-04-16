"use client";

import { createRunAction } from "@/app/actions/run";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function CreateRunPage() {
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [selectedInstallationId, setSelectedInstallationId] = useState<
    number | null
  >(null);
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);

  const installations = useQuery({
    queryKey: ["installationsWithRepos"],
    queryFn: async () => {
      const response = await fetch("/api/github/installations");
      if (!response.ok) throw new Error("Failed to fetch installations");
      const data = await response.json();
      return data as {
        installationId: number;
        repositories: { id: number; full_name: string }[];
      }[];
    },
  });

  const issues = useQuery({
    queryKey: ["issues", selectedRepo, selectedInstallationId],
    queryFn: async () => {
      if (!selectedRepo || !selectedInstallationId) return [];
      const response = await fetch(
        `/api/github/issues?repo=${encodeURIComponent(
          selectedRepo
        )}&installationId=${selectedInstallationId}`
      );
      if (!response.ok) throw new Error("Failed to fetch issues");
      const data = await response.json();
      return data.issues as { id: number; number: number; title: string }[];
    },
    enabled: !!selectedRepo && !!selectedInstallationId,
  });

  const handleRepoChange = (value: string) => {
    setSelectedRepo(value);
    setSelectedIssue(null);
    for (const installation of installations.data || []) {
      const repo = installation.repositories.find((r) => r.full_name === value);
      if (repo) {
        setSelectedInstallationId(installation.installationId);
        break;
      }
    }
  };

  const handleIssueChange = (value: string) => {
    setSelectedIssue(Number(value));
  };

  const createRun = useMutation({
    mutationFn: async () => {
      if (!selectedRepo || !selectedInstallationId || !selectedIssue) return;
      return await createRunAction({
        installationId: selectedInstallationId,
        issueNumber: selectedIssue,
        repoFullName: selectedRepo,
      });
    },
  });

  return (
    <div className="max-w-2xl w-full mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Run</CardTitle>
          <CardDescription>
            Select a repository and issue to start a new run
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="repository">Repository</Label>
            <Select value={selectedRepo} onValueChange={handleRepoChange}>
              <SelectTrigger id="repository" className="w-full">
                <SelectValue placeholder="Select a repository" />
              </SelectTrigger>
              <SelectContent>
                {(installations.data || []).map((installation) => (
                  <div key={installation.installationId}>
                    {installation.repositories.map((repo) => (
                      <SelectItem key={repo.id} value={repo.full_name}>
                        {repo.full_name}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="issue">Issue</Label>
            <Select
              value={selectedIssue ? String(selectedIssue) : ""}
              onValueChange={handleIssueChange}
              disabled={!selectedRepo || issues.isLoading}
            >
              <SelectTrigger id="issue" className="w-full">
                {issues.isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading issues...
                  </div>
                ) : (
                  <SelectValue placeholder="Select an issue" />
                )}
              </SelectTrigger>
              <SelectContent>
                {(issues.data || []).map((issue) => (
                  <SelectItem key={issue.id} value={String(issue.number)}>
                    #{issue.number} {issue.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={() => createRun.mutate()}
            disabled={!selectedRepo || !selectedIssue || createRun.isPending}
          >
            {createRun.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Run...
              </>
            ) : (
              "Create Run"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
