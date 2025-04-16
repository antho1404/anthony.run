import { Brandmark } from "@/components/brandmark";
import RunList from "@/components/run-list";
import { Button } from "@/components/ui/button";
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserButton } from "@clerk/nextjs";
import {
  FileTextIcon,
  MessageSquareIcon,
  PlusIcon,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import { PropsWithChildren, Suspense } from "react";

export default async function Dashboard({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="offcanvas">
        <SidebarHeader className="text-lg font-semibold pl-10 flex flex-row">
          <Link href="/dashboard">
            <Brandmark />
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <Button size="lg" asChild className="w-full">
              <Link href="/dashboard/runs">
                <PlusIcon className="size-4" />
                New Run
              </Link>
            </Button>
            <SidebarGroupLabel className="mt-4">Runs</SidebarGroupLabel>
            <SidebarGroupContent>
              <Suspense>
                <RunList />
              </Suspense>
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
