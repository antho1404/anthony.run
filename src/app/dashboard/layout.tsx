import { Brandmark } from "@/components/brandmark";
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
import { Badge } from "@/components/ui/badge";
import { getUserSubscription } from "@/lib/stripe/subscription";
import { STRIPE_PLANS } from "@/lib/stripe";
import { auth } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import {
  FileTextIcon,
  HistoryIcon,
  HomeIcon,
  MessageSquareIcon,
  SettingsIcon,
  CreditCardIcon,
} from "lucide-react";
import Link from "next/link";
import { PropsWithChildren } from "react";

export default async function Dashboard({ children }: PropsWithChildren) {
  const { userId } = auth();
  const subscription = userId ? await getUserSubscription(userId) : null;
  const planName = subscription?.plan 
    ? STRIPE_PLANS[subscription.plan].name 
    : 'Free';

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
                  <Link href="/dashboard">
                    <SidebarMenuButton>
                      <HomeIcon />
                      Home
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/dashboard/history">
                    <SidebarMenuButton>
                      <HistoryIcon />
                      History
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/dashboard/settings">
                    <SidebarMenuButton>
                      <CreditCardIcon />
                      Subscription
                      <Badge variant="outline" className="ml-2">
                        {planName}
                      </Badge>
                    </SidebarMenuButton>
                  </Link>
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
                  <Link href="/documentation">
                    <SidebarMenuButton>
                      <FileTextIcon />
                      Documentation
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/dashboard/settings">
                    <SidebarMenuButton>
                      <SettingsIcon />
                      Settings
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/feedback">
                    <SidebarMenuButton>
                      <MessageSquareIcon />
                      Feedback
                    </SidebarMenuButton>
                  </Link>
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
