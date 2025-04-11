import { AuroraText } from "@/components/magicui/aurora-text";
import { Button } from "@/components/ui/button";
import { GitHubIssue } from "@/components/github-issue";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Waitlist } from "@clerk/nextjs";
import { ChevronRightIcon, InfoIcon, Loader2Icon } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project to name *",
  description:
    "Get ready for a revolutionary app designed to transform issues into ready-to-merge pull requests — saving your team up to 90% of development time.",
};

export default function Home() {
  return (
    <>
      <Button variant="outline" size="sm" className="rounded-full" asChild>
        <a
          href="https://coral-napkin-358.notion.site/1cf739cd9dee802cae93e5effb0f03d2?pvs=105"
          target="_blank"
          className="flex gap-2 items-center mt-4 text-muted-foreground"
        >
          Participate to our survey
          <ChevronRightIcon />
        </a>
      </Button>

      <h1 className="text-5xl md:text-7xl font-bold mb-8 mt-4">
        Project to name<sup>*</sup>
      </h1>

      <p className="text-xl md:text-2xl text-muted-foreground max-w-xl">
        Ever wished you could close these GitHub issues{" "}
        <AuroraText>automagically?</AuroraText>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <InfoIcon className="size-4 ml-2" />
            </TooltipTrigger>
            <TooltipContent>
              <p>There is no magic but there is AI</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>{" "}
      </p>

      <p className="text-lg md:text-xl text-muted-foreground max-w-xl mt-4">
        Get ready for a revolutionary app designed to{" "}
        <span className="italic font-semibold">
          transform issues into ready-to-merge pull requests
        </span>{" "}
        — saving your team up to 90% of development time.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 mb-8 w-full max-w-3xl">
        <GitHubIssue
          number={42}
          title="Fix responsive layout on mobile devices"
          label="bug"
          comments={3}
          createdAt="2 days ago"
        />
        <GitHubIssue
          number={57}
          title="Implement authentication flow"
          label="feature"
          comments={8}
          createdAt="1 week ago"
        />
        <GitHubIssue
          number={64}
          title="Improve accessibility for screen readers"
          label="accessibility"
          isOpen={false}
          comments={5}
          createdAt="3 days ago"
        />
        <GitHubIssue
          number={78}
          title="Optimize database queries for better performance"
          label="performance"
          comments={2}
          createdAt="12 hours ago"
        />
      </div>
      
      <div className="min-h-80 flex items-center justify-center w-full max-w-96 mt-8">
        <Waitlist
          fallback={<Loader2Icon className="absolute animate-spin" />}
        />
      </div>
      <p className="text-sm md:fixed bottom-0 right-0 p-4 text-muted-foreground bg-gradient-to-t md:bg-none from-transparent via-white to-white">
        <sup>*</sup> We promise we will find a good name, you have some idea?{" "}
        <a target="_blank" href="https://x.com/antho1404" className="link">
          Reach out.
        </a>
      </p>
    </>
  );
}
