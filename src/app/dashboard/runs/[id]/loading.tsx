import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GithubIcon, Loader2 } from "lucide-react";

export default async function Loader() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold truncate flex items-center gap-2">
            <GithubIcon className="h-4 w-4" />
            <Skeleton className="h-8 w-96" />
          </h1>
          <div className="text-sm text-muted-foreground">
            <Skeleton className="size-5 w-12" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="size-8 w-40" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Execution Logs</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    </div>
  );
}
