import { Toolbar, ToolbarAction, ToolbarTitle } from "@/components/toolbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export default async function Loader() {
  return (
    <div className="space-y-6">
      <Toolbar>
        <ToolbarTitle description={<Skeleton className="size-5 w-12" />}>
          <Skeleton className="size-4" />
          <Skeleton className="size-8 w-96" />
        </ToolbarTitle>
        <ToolbarAction>
          <Skeleton className="size-8 w-40" />
        </ToolbarAction>
      </Toolbar>

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
