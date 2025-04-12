import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getExecutionHistory, getMachineStatus } from "@/lib/runner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { CodeIcon, GitBranchIcon, PlayIcon, RefreshCwIcon } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project to name * Execution History",
  description: "View your past machine executions",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function History() {
  const executions = await getExecutionHistory();

  async function refreshStatus(formData: FormData) {
    "use server";
    const machineId = formData.get("machineId");
    if (!machineId) throw new Error("Invalid machine ID");

    await getMachineStatus(machineId.toString());
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Execution History</CardTitle>
          <form action="/dashboard/history">
            <Button size="sm" variant="outline" type="submit">
              <RefreshCwIcon className="size-4 mr-2" />
              Refresh
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of all machine executions.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Repository</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {executions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No executions found. Run a prompt on a repository to see
                    results here.
                  </TableCell>
                </TableRow>
              ) : (
                executions.map((execution) => (
                  <TableRow key={execution.machineId}>
                    <TableCell className="font-medium flex items-center gap-1">
                      <CodeIcon className="size-4" />
                      {execution.repository}
                    </TableCell>
                    <TableCell className="flex items-center gap-1">
                      <GitBranchIcon className="size-4" />
                      {execution.branch}
                    </TableCell>
                    <TableCell>
                      <div
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          execution.status === "started"
                            ? "bg-green-100 text-green-800"
                            : execution.status === "destroyed"
                            ? "bg-red-100 text-red-800"
                            : execution.status === "stopping"
                            ? "bg-yellow-100 text-yellow-800"
                            : execution.status === "creating"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        )}
                      >
                        {execution.status}
                      </div>
                    </TableCell>
                    <TableCell>
                      {execution.createdAt
                        ? formatDistanceToNow(new Date(execution.createdAt), {
                            addSuffix: true,
                          })
                        : "Unknown"}
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <form action={refreshStatus} className="inline-block">
                        <input
                          type="hidden"
                          name="machineId"
                          value={execution.machineId}
                        />
                        <Button size="sm" variant="outline" type="submit">
                          <RefreshCwIcon className="size-3 mr-1" />
                          Refresh
                        </Button>
                      </form>
                      <Button size="sm" asChild>
                        <a href={`/dashboard/history/${execution.machineId}`}>
                          <PlayIcon className="size-3 mr-1" />
                          Details
                        </a>
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
          <CardTitle>Machine Details</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-4">
          <p>
            Machine executions are temporary instances that process your prompts
            on GitHub repositories. Each execution runs your prompt against the
            specified branch and automatically destroys itself when complete.
          </p>
          <p>The status of each execution shows its current state:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <span className="font-semibold">started</span>: The machine is
              currently running
            </li>
            <li>
              <span className="font-semibold">stopped</span>: The machine has
              completed its execution
            </li>
            <li>
              <span className="font-semibold">destroyed</span>: The machine has
              been removed
            </li>
            <li>
              <span className="font-semibold">creating</span>: The machine is
              being set up
            </li>
            <li>
              <span className="font-semibold">stopping</span>: The machine is
              shutting down
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
