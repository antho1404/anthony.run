"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitHubIssue as GitHubIssueType } from "@/lib/github";
import { cn } from "@/lib/utils";
import { CircleIcon, ExternalLinkIcon, MessageSquareIcon } from "lucide-react";
import Link from "next/link";
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

interface LegacyGitHubIssueProps {
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
}: LegacyGitHubIssueProps & React.HTMLAttributes<HTMLDivElement>) {
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

interface GitHubIssueCardProps {
  issue: GitHubIssueType;
  onSolve?: (issue: GitHubIssueType) => void;
}

export function GitHubIssueCard({ issue, onSolve }: GitHubIssueCardProps) {
  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium">
            <Link 
              href={issue.html_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline flex items-center gap-1"
            >
              #{issue.number} {issue.title}
              <ExternalLinkIcon className="size-3" />
            </Link>
          </h3>
          <p className="text-sm text-muted-foreground">
            {issue.repository.full_name}
          </p>
        </div>
        <div className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
          issue.state === "open" 
            ? "bg-green-100 text-green-800" 
            : "bg-yellow-100 text-yellow-800"
        )}>
          {issue.state}
        </div>
      </div>
      <div className="text-sm line-clamp-3 mb-3">
        {issue.body}
      </div>
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Created: {new Date(issue.created_at).toLocaleDateString()}</span>
        {onSolve && (
          <Button 
            size="sm"
            onClick={() => onSolve(issue)}
          >
            Solve
          </Button>
        )}
      </div>
    </div>
  );
}
