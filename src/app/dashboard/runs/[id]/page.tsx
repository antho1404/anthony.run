import { LiveLogs } from "@/components/live-logs";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth } from "@clerk/nextjs";
import { format } from "date-fns";
import { ArrowLeftIcon, GithubIcon, ExternalLinkIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getContainerLogs, isContainerRunning } from "@/lib/docker";

export const metadata: Metadata = {
  title: "Run Execution • anthony • run",
  description: "View execution logs",
};

export default async function RunDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = auth();
  if (!userId) redirect("/login");

  const run = await prisma.run.findUnique({
    where: {
      id: params.id,
      userId,
    },
  });

  if (!run) {
    redirect("/dashboard/runs");
  }

  // Determine if the container is running
  let isRunning = false;
  let logs = run.output || "";

  if (run.containerId) {
    isRunning = await isContainerRunning(run.containerId);
    
    if (isRunning) {
      try {
        logs = await getContainerLogs(run.containerId);
      } catch (error) {
        console.error("Error fetching container logs:", error);
      }
    }
  }

  const isErrored = !!run.error;
  const isSuccess = !!run.output && !run.error;

  // Format the repository URL for display
  const repoName = run.repoUrl.split('/').slice(-2).join('/');
  const issueUrl = run.issueNumber 
    ? `${run.repoUrl}/issues/${run.issueNumber}`
    : run.repoUrl;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/runs">
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold truncate">
              {repoName}
              {run.issueNumber ? ` #${run.issueNumber}` : ''}
            </h1>
            <p className="text-sm text-muted-foreground">
              {format(new Date(run.createdAt), "PPpp")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isErrored && (
            <div className="px-2 py-1 text-xs rounded-full bg-destructive/15 text-destructive">
              Error
            </div>
          )}
          {isSuccess && (
            <div className="px-2 py-1 text-xs rounded-full bg-green-500/15 text-green-500">
              Success
            </div>
          )}
          {isRunning && (
            <div className="px-2 py-1 text-xs rounded-full bg-amber-500/15 text-amber-500">
              Running
            </div>
          )}
          <Button size="sm" variant="outline" asChild>
            <a href={issueUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
              <GithubIcon className="h-4 w-4" />
              View on GitHub
              <ExternalLinkIcon className="h-3 w-3" />
            </a>
          </Button>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Run Details</CardTitle>
              <CardDescription>Information about this run</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Repository</h3>
                <p className="text-sm text-muted-foreground truncate">{run.repoUrl}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Branch</h3>
                <p className="text-sm text-muted-foreground">{run.branch}</p>
              </div>
              {run.issueNumber && (
                <div>
                  <h3 className="text-sm font-medium">Issue</h3>
                  <p className="text-sm text-muted-foreground">#{run.issueNumber}</p>
                </div>
              )}
              {run.containerId && (
                <div>
                  <h3 className="text-sm font-medium">Container</h3>
                  <p className="text-sm text-muted-foreground truncate">{run.containerId}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium">Status</h3>
                <p className="text-sm">
                  {isErrored && <span className="text-destructive">Error</span>}
                  {isSuccess && <span className="text-green-500">Success</span>}
                  {isRunning && <span className="text-amber-500">Running</span>}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prompt</CardTitle>
              <CardDescription>Original instruction prompt</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                {run.prompt}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Execution Logs</CardTitle>
              <CardDescription>
                {isRunning ? "Live logs from the container" : "Output from execution"}
                {isRunning && (
                  <span className="ml-2 inline-block px-2 py-1 text-xs rounded-full bg-amber-500/15 text-amber-500">
                    Running
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isErrored && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md mb-4">
                  <strong>Error:</strong> {run.error}
                </div>
              )}
              
              <LiveLogs 
                runId={run.id} 
                initialLogs={logs} 
                initialIsRunning={isRunning} 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}