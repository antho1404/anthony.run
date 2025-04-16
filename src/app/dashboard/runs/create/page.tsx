"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

type Repository = {
  id: number;
  name: string;
  full_name: string;
};

type Account = {
  id: number;
  login: string;
};

type InstallationWithRepos = {
  installationId: number;
  account: Account;
  repositories: Repository[];
};

type Issue = {
  id: number;
  number: number;
  title: string;
  html_url: string;
};

export default function CreateRunPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [installationsWithRepos, setInstallationsWithRepos] = useState<InstallationWithRepos[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [selectedInstallationId, setSelectedInstallationId] = useState<number | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<number | null>(null);
  const [issuesLoading, setIssuesLoading] = useState(false);

  // Fetch installations and repositories
  useEffect(() => {
    async function fetchInstallationsWithRepos() {
      setLoading(true);
      try {
        const response = await fetch("/api/github/installations");
        if (!response.ok) throw new Error("Failed to fetch installations");
        const data = await response.json();
        setInstallationsWithRepos(data);
      } catch (error) {
        console.error("Error fetching installations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchInstallationsWithRepos();
  }, []);

  // Fetch issues when a repository is selected
  useEffect(() => {
    if (!selectedRepo || !selectedInstallationId) {
      setIssues([]);
      return;
    }

    async function fetchIssues() {
      setIssuesLoading(true);
      try {
        const response = await fetch(
          `/api/github/issues?repo=${encodeURIComponent(selectedRepo)}&installationId=${selectedInstallationId}`
        );
        if (!response.ok) throw new Error("Failed to fetch issues");
        const data = await response.json();
        setIssues(data.issues);
      } catch (error) {
        console.error("Error fetching issues:", error);
      } finally {
        setIssuesLoading(false);
      }
    }

    fetchIssues();
  }, [selectedRepo, selectedInstallationId]);

  const handleRepoChange = (value: string) => {
    setSelectedRepo(value);
    setSelectedIssue(null);
    
    // Find the installation ID for the selected repo
    for (const installation of installationsWithRepos) {
      const repo = installation.repositories.find(r => r.full_name === value);
      if (repo) {
        setSelectedInstallationId(installation.installationId);
        break;
      }
    }
  };

  const handleIssueChange = (value: string) => {
    setSelectedIssue(Number(value));
  };

  const handleSubmit = async () => {
    if (!selectedRepo || !selectedInstallationId || !selectedIssue) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/runs/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoFullName: selectedRepo,
          installationId: selectedInstallationId,
          issueNumber: selectedIssue,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create run");
      }

      const data = await response.json();
      router.push(`/dashboard/runs/${data.runId}`);
    } catch (error) {
      console.error("Error creating run:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Run</CardTitle>
          <CardDescription>
            Select a repository and issue to start a new run
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="repository">Repository</Label>
                <Select value={selectedRepo} onValueChange={handleRepoChange}>
                  <SelectTrigger id="repository" className="w-full">
                    <SelectValue placeholder="Select a repository" />
                  </SelectTrigger>
                  <SelectContent>
                    {installationsWithRepos.map((installation) => (
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
                  disabled={!selectedRepo || issuesLoading}
                >
                  <SelectTrigger id="issue" className="w-full">
                    {issuesLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading issues...
                      </div>
                    ) : (
                      <SelectValue placeholder="Select an issue" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {issues.map((issue) => (
                      <SelectItem key={issue.id} value={String(issue.number)}>
                        #{issue.number} {issue.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!selectedRepo || !selectedIssue || submitting}
          >
            {submitting ? (
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
