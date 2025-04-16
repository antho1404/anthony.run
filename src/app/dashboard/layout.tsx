import { Brandmark } from "@/components/brandmark";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { prisma } from "@/lib/prisma";
import { UserButton, auth } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import {
  FileTextIcon,
  HistoryIcon,
  HomeIcon,
  MessageSquareIcon,
  PlayIcon,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import { PropsWithChildren } from "react";

export default async function Dashboard({ children }: PropsWithChildren) {
  const { userId } = auth();
  
  // Fetch the most recent 10 runs for the sidebar
  const recentRuns = userId
    ? await prisma.run.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    : [];

  // Count total runs for the badge
  const totalRuns = userId
    ? await prisma.run.count({
        where: { userId },
      })
    : 0;

  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="offcanvas">
        <SidebarHeader className="text-lg font-semibold pl-10 flex flex-row">
          <Brandmark />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={false}>
                    <Link href="/dashboard">
                      <HomeIcon />
                      Home
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={false}>
                    <Link href="/dashboard/runs">
                      <HistoryIcon />
                      Runs
                      {totalRuns > 0 && <SidebarMenuBadge>{totalRuns}</SidebarMenuBadge>}
                    </Link>
                  </SidebarMenuButton>
                  
                  {recentRuns.length > 0 && (
                    <SidebarMenuSub>
                      {recentRuns.map((run) => {
                        const isErrored = !!run.error;
                        const isSuccess = !!run.output && !run.error;
                        const isRunning = !run.output && !run.error;
                        
                        let statusClass = "";
                        if (isErrored) statusClass = "text-destructive";
                        else if (isSuccess) statusClass = "text-green-500";
                        else if (isRunning) statusClass = "text-amber-500";
                        
                        const repoName = run.repoUrl.split('/').slice(-2).join('/');
                        const timeAgo = formatDistanceToNow(new Date(run.createdAt), {
                          addSuffix: true,
                        });
                        
                        return (
                          <SidebarMenuSubItem key={run.id}>
                            <SidebarMenuSubButton asChild>
                              <Link href={`/dashboard/runs/${run.id}`} className="flex justify-between">
                                <span className="truncate flex items-center gap-1">
                                  <PlayIcon className={`h-3 w-3 ${statusClass}`} />
                                  {repoName}
                                  {run.issueNumber ? ` #${run.issueNumber}` : ''}
                                </span>
                                <span className="text-xs text-muted-foreground ml-1">{timeAgo}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                      
                      {totalRuns > 10 && (
                        <>
                          <SidebarSeparator className="my-1" />
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild>
                              <Link href="/dashboard/runs">
                                <span className="text-center w-full">View all runs</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </>
                      )}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <FileTextIcon />
                    Documentation
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <SettingsIcon />
                    Settings
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <MessageSquareIcon />
                    Feedback
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <UserButton
                  appearance={{
                    elements: {
                      userButtonBox: {
                        flexDirection: "row-reverse",
                        width: "100%",
                        gap: 1,
                      },
                    },
                  }}
                  fallback={<Skeleton className="h-7 rounded-full w-full" />}
                  showName
                />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>
      <SidebarTrigger className="fixed top-4 left-4 z-10" />
      <SidebarInset className="mx-auto py-4 px-4">{children}</SidebarInset>
    </SidebarProvider>
  );
}
