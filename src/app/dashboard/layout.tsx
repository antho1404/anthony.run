import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
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
  CircleAlertIcon,
  FileTextIcon,
  HistoryIcon,
  HomeIcon,
  MessageSquareIcon,
  SettingsIcon,
} from "lucide-react";
import { PropsWithChildren } from "react";

export default function Dashboard({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="offcanvas">
        <SidebarHeader className="text-lg font-semibold pl-10">
          Project to name
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <HomeIcon />
                    Home
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <CircleAlertIcon />
                    Issues
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <HistoryIcon />
                    History
                  </SidebarMenuButton>
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
