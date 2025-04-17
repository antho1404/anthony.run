import RunList from "@/components/run-list";
import { Toolbar, ToolbarAction, ToolbarTitle } from "@/components/toolbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlayIcon, PlusIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Runs • anthony • run",
  description: "View your execution history",
};

export default async function Runs() {
  return (
    <div className="space-y-6">
      <Toolbar>
        <ToolbarTitle>
          <PlayIcon className="size-4" />
          Runs
        </ToolbarTitle>
        <ToolbarAction>
          <Button size="sm" variant="outline" asChild>
            <Link
              href="/dashboard/runs/create"
              className="flex items-center gap-1"
            >
              <PlusIcon className="size-4" />
              Add new run
            </Link>
          </Button>
        </ToolbarAction>
      </Toolbar>

      <Card>
        <CardHeader>
          <CardTitle>Execution Logs</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>
        <CardContent>
          <RunList />
        </CardContent>
      </Card>
    </div>
  );
}
