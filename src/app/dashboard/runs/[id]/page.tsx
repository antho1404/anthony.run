import ContainerLogs from "@/components/logs";
import { Toolbar, ToolbarAction, ToolbarTitle } from "@/components/toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { ExternalLinkIcon, GithubIcon, Loader2 } from "lucide-react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Run Execution • anthony • run",
  description: "View execution logs",
};

export default async function RunDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) notFound();

  const run = await prisma.run.findUnique({ where: { id, userId } });
  if (!run) notFound();

  const publicRepoUrl = new URL(run.repoUrl);
  publicRepoUrl.password = "";
  publicRepoUrl.username = "";
  const repoName = publicRepoUrl.pathname.slice(1);
  const issueUrl = `${publicRepoUrl.toString()}/issues/${run.issueNumber}`;

  return (
    <div className="space-y-6">
      <Toolbar>
        <ToolbarTitle description={format(new Date(run.createdAt), "PPpp")}>
          <GithubIcon className="h-4 w-4" />
          {repoName} #{run.issueNumber}
          {run.error ? (
            <Badge variant="destructive">Error</Badge>
          ) : run.output ? (
            <Badge>Success</Badge>
          ) : (
            <Badge variant="outline">Processing</Badge>
          )}
        </ToolbarTitle>
        <ToolbarAction>
          <Button size="sm" variant="outline" asChild>
            <a
              href={issueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <GithubIcon className="h-4 w-4" />
              View on GitHub
              <ExternalLinkIcon className="h-3 w-3" />
            </a>
          </Button>
        </ToolbarAction>
      </Toolbar>

      <Card>
        <CardHeader>
          <CardTitle>Execution Logs</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            }
          >
            <ContainerLogs id={run.containerId!} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
