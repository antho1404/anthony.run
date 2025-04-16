import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { GithubIcon, PlayIcon, LoaderIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Runs • anthony • run",
  description: "View all your execution runs",
};

export default async function RunsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const { userId } = auth();
  if (!userId) redirect("/login");

  const page = Number(searchParams.page) || 1;
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const [runs, total] = await Promise.all([
    prisma.run.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.run.count({
      where: { userId },
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Execution Runs</h1>
      </div>
      <Separator />

      <div className="grid gap-4">
        {runs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <p className="text-muted-foreground mb-4">No runs found</p>
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          runs.map((run) => {
            const isErrored = !!run.error;
            const isSuccess = !!run.output && !run.error;
            const isRunning = !run.output && !run.error;
            
            return (
              <Card key={run.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="truncate">
                      <Link
                        href={`/dashboard/runs/${run.id}`}
                        className="hover:underline"
                      >
                        {run.repoUrl.split('/').slice(-2).join('/')}
                        {run.issueNumber ? ` #${run.issueNumber}` : ''}
                      </Link>
                    </CardTitle>
                    <div className="flex space-x-1 text-xs text-muted-foreground">
                      {isErrored && (
                        <span className="text-destructive">Error</span>
                      )}
                      {isSuccess && (
                        <span className="text-green-500">Success</span>
                      )}
                      {isRunning && (
                        <span className="text-amber-500 flex items-center gap-1">
                          <LoaderIcon className="animate-spin h-3 w-3" />
                          Running
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex gap-2">
                    <span>
                      {formatDistanceToNow(new Date(run.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    <div className="flex items-center gap-1">
                      <GithubIcon className="w-3 h-3" />
                      <span>Branch: {run.branch}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground truncate mb-4">
                    {run.prompt.substring(0, 100)}
                    {run.prompt.length > 100 ? "..." : ""}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    asChild
                  >
                    <Link href={`/dashboard/runs/${run.id}`}>
                      <PlayIcon className="w-4 h-4" />
                      View Execution
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {page > 1 && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link
                  href={`/dashboard/runs?page=${page - 1}`}
                  prefetch={false}
                >
                  Previous
                </Link>
              </Button>
            )}
            
            <div className="flex items-center px-4">
              Page {page} of {totalPages}
            </div>
            
            {page < totalPages && (
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link
                  href={`/dashboard/runs?page=${page + 1}`}
                  prefetch={false}
                >
                  Next
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}