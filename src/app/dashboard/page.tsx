import { Button } from "@/components/ui/button";
import {
  CircleAlertIcon,
  GithubIcon,
  HistoryIcon,
  SlidersIcon,
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard • anthony • run",
  description:
    "Get ready for a revolutionary app designed to transform issues into ready-to-merge pull requests — saving your team up to 90% of development time.",
};

export default async function Dashboard() {
  const links = [
    {
      icon: GithubIcon,
      title: "Connect GitHub",
      description: "Link your repositories",
      link: `https://github.com/apps/${
        process.env.GITHUB_APP_NAME || ""
      }/installations/select_target`,
    },
    {
      icon: CircleAlertIcon,
      title: "Solve an Issue",
      description: "Fix problems in your projects",
      link: "/dashboard/issues",
    },
    {
      icon: HistoryIcon,
      title: "History",
      description: "View your past activities",
      link: "/dashboard/history",
    },
    {
      icon: SlidersIcon,
      title: "Customize",
      description: "Personalize your dashboard",
      link: "/dashboard/settings",
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto md:mt-20 space-y-6">
      <h1 className="peer- text-2xl font-bold">Get Started</h1>
      <div className="flex flex-col space-y-4">
        {links.map((link, i) => (
          <Button
            variant="outline"
            className="justify-start gap-3 h-auto p-3 group"
            key={i}
            asChild
          >
            <Link href={link.link}>
              <link.icon className="size-4" />
              <div className="flex flex-col items-start">
                <span>{link.title}</span>
                <span className="text-xs text-muted-foreground">
                  {link.description}
                </span>
              </div>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
