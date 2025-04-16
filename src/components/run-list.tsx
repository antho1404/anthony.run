import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const LIMIT = 10;

export default async function RunList() {
  const { userId } = await auth();

  const recentRuns = userId
    ? await prisma.run.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: LIMIT,
      })
    : [];

  return (
    <>
      {recentRuns.length > 0 && (
        <SidebarMenu>
          {recentRuns.map((run) => (
            <SidebarMenuItem key={run.id}>
              <SidebarMenuButton asChild className="h-auto">
                <Link href={`/dashboard/runs/${run.id}`}>
                  <div className="flex flex-col items-start w-full">
                    <span className="flex items-center justify-between w-full">
                      <span className="truncate">#{run.issueNumber}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(run.createdAt, {
                          addSuffix: true,
                        })}
                      </span>
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {new URL(run.repoUrl).pathname.slice(1)}
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      )}
    </>
  );
}
