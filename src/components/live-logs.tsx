"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LoaderIcon } from "lucide-react";

interface LiveLogsProps {
  runId: string;
  initialLogs: string;
  initialIsRunning: boolean;
}

export function LiveLogs({ runId, initialLogs, initialIsRunning }: LiveLogsProps) {
  const [logs, setLogs] = useState(initialLogs);
  const [isRunning, setIsRunning] = useState(initialIsRunning);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isRunning) return;

    const pollInterval = setInterval(async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/runs/${runId}/logs`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch logs");
        }
        
        const data = await response.json();
        setLogs(data.logs);
        setIsRunning(data.isRunning);
        
        if (!data.isRunning) {
          clearInterval(pollInterval);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        clearInterval(pollInterval);
      } finally {
        setIsLoading(false);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [runId, isRunning]);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-amber-500">
          <LoaderIcon className="h-3 w-3 animate-spin" />
          Refreshing logs...
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md mb-4">
          Error refreshing logs: {error}
        </div>
      )}
      
      <div className="bg-muted rounded-md p-4 overflow-auto max-h-[600px]">
        {logs ? (
          <pre className="text-xs whitespace-pre-wrap break-words">{logs}</pre>
        ) : (
          <Skeleton className="h-40 w-full" />
        )}
      </div>
      
      {isRunning && (
        <div className="mt-4 flex justify-center">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <LoaderIcon className="h-3 w-3 animate-spin" />
            Execution in progress. Logs are automatically refreshed.
          </p>
        </div>
      )}
    </div>
  );
}