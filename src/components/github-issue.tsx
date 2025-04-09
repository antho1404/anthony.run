import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CircleIcon, MessageSquareIcon } from "lucide-react";
import type React from "react";

type Label =
  | "bug"
  | "documentation"
  | "test"
  | "high priority"
  | "feature"
  | "accessibility"
  | "devops"
  | "testing"
  | "performance"
  | "wontfix"
  | "dependencies";

interface GitHubIssueProps {
  number: number;
  title: string;
  isOpen?: boolean;
  label: Label;
  comments?: number;
  createdAt?: string;
  className?: string;
}

export function GitHubIssue({
  number,
  title,
  label,
  isOpen = true,
  comments = 0,
  createdAt,
  className,
  ...props
}: GitHubIssueProps & React.HTMLAttributes<HTMLDivElement>) {
  const color = {
    bug: "#d73a4a",
    documentation: "#0075ca",
    test: "#bfd4f2",
    "high priority": "#b60205",
    feature: "#a2eeef",
    accessibility: "#1d76db",
    devops: "#7057ff",
    testing: "#bfd4f2",
    performance: "#7057ff",
    wontfix: "#444444",
    dependencies: "#0366d6",
  } satisfies Record<Label, string>;
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-md shadow-sm bg-white text-sm",
        className
      )}
      {...props}
    >
      <CircleIcon
        className={`w-4 h-4 ${isOpen ? "text-green-500" : "text-purple-500"} ${
          !isOpen && "fill-purple-500"
        }`}
        strokeWidth={1.5}
      />

      <div className="flex-1 truncate flex flex-col space-y-1">
        <span className="font-medium">{title}</span>
        <Badge
          className="text-xs"
          style={{ backgroundColor: `${color[label]}20`, color: color[label] }}
        >
          {label}
        </Badge>
      </div>

      <div className="flex flex-col items-end gap-2 text-muted-foreground shrink-0">
        {comments > 0 && (
          <div className="flex items-center gap-1">
            <MessageSquareIcon className="w-3.5 h-3.5" />
            <span className="text-xs">{comments}</span>
          </div>
        )}

        {createdAt && (
          <span className="text-xs whitespace-nowrap">
            #{number} opened {createdAt}
          </span>
        )}
      </div>
    </div>
  );
}
