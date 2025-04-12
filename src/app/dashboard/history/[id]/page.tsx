import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getMachineEvents, getMachineStatus } from "@/lib/runner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { ArrowLeftIcon, RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MachineDetail({
  params,
}: {
  params: { id: string };
}) {
  const machineId = params.id;
  const machine = await getMachineStatus(machineId);

  if (!machine) {
    notFound();
  }

  const { repository, branch } = machine.machineName.startsWith("repo-")
    ? (() => {
        const parts = machine.machineName.split("-");
        const timestamp = parts.pop();
        const branch = parts.pop() || "unknown";
        parts.shift(); // Remove "repo-"
        return { repository: parts.join("/"), branch };
      })()
    : { repository: "unknown", branch: "unknown" };

  const events = machine.events || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/history" className="flex items-center text-sm hover:underline">
          <ArrowLeftIcon className="size-4 mr-1" />
          Back to Execution History
        </Link>
        <form action={`/dashboard/history/${machineId}`}>
          <Button size="sm" variant="outline" type="submit">
            <RefreshCwIcon className="size-4 mr-2" />
            Refresh
          </Button>
        </form>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Machine Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Machine ID</p>
              <p className="text-sm font-mono">{machine.machineId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div
                className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                  machine.status === "started"
                    ? "bg-green-100 text-green-800"
                    : machine.status === "destroyed"
                    ? "bg-red-100 text-red-800"
                    : machine.status === "stopping"
                    ? "bg-yellow-100 text-yellow-800"
                    : machine.status === "creating"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                )}
              >
                {machine.status}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Repository</p>
              <p className="text-sm">{repository}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Branch</p>
              <p className="text-sm">{branch}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="text-sm">
                {machine.createdAt 
                  ? `${format(new Date(machine.createdAt), "PPpp")} (${formatDistanceToNow(new Date(machine.createdAt), { addSuffix: true })})` 
                  : "Unknown"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Updated</p>
              <p className="text-sm">
                {machine.updatedAt 
                  ? `${format(new Date(machine.updatedAt), "PPpp")} (${formatDistanceToNow(new Date(machine.updatedAt), { addSuffix: true })})` 
                  : "Unknown"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Region</p>
              <p className="text-sm">{machine.region}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Image</p>
              <p className="text-sm font-mono truncate">{machine.config?.image || "Unknown"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Event History</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events found for this machine.</p>
          ) : (
            <div className="relative">
              <div className="space-y-2">
                {events.map((event, index) => (
                  <div key={index} className="relative pl-5 pb-2">
                    <div className="absolute left-0 top-2 w-0.5 h-full -ml-px bg-muted" />
                    <div className="absolute left-0 top-2 w-2 h-2 rounded-full border-2 border-primary bg-background" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {event.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.timestamp ? formatDistanceToNow(new Date(event.timestamp), { addSuffix: true }) : "Unknown time"}
                        </p>
                      </div>
                      {event.message && (
                        <p className="text-sm text-muted-foreground">{event.message}</p>
                      )}
                      {event.request?.command && (
                        <div className="p-2 bg-muted rounded text-xs font-mono whitespace-pre-wrap">
                          {event.request.command}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}