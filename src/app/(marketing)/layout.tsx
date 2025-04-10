import { GitHubIssue } from "@/components/github-issue";
import { GridBackground } from "@/components/grid-background";
import Image from "next/image";
import Link from "next/link";
import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  const issues = [
    {
      number: 1234,
      title: "Fix API endpoint authentication",
      isOpen: true,
      label: "bug",
      comments: 3,
      createdAt: "2d ago",
      style: {
        top: "69%",
        left: "77%",
        transform:
          "rotate(-1deg) scale(0.85) translateX(-50%) translateY(-50%)",
      },
    },
    {
      number: 1242,
      title: "Fix broken links in README",
      isOpen: true,
      label: "documentation",
      comments: 1,
      createdAt: "5m ago",
      style: {
        top: "16%",
        left: "14%",
        transform:
          "rotate(-1deg) scale(0.92) translateX(-50%) translateY(-50%)",
      },
    },
    {
      number: 1235,
      title: "Update documentation for new features",
      isOpen: true,
      label: "documentation",
      comments: 0,
      createdAt: "1d ago",
      style: {
        top: "47%",
        left: "72%",
        transform: "rotate(0deg) scale(0.94) translateX(-50%) translateY(-50%)",
      },
    },
    {
      number: 1237,
      title: "Add unit tests for user authentication",
      isOpen: true,
      label: "test",
      comments: 2,
      createdAt: "3h ago",
      style: {
        top: "22%",
        left: "63%",
        transform:
          "rotate(-4deg) scale(0.96) translateX(-50%) translateY(-50%)",
      },
    },
    {
      number: 1244,
      title: "Add error handling for API requests",
      isOpen: true,
      label: "bug",
      comments: 2,
      createdAt: "just now",
      style: {
        top: "59%",
        left: "13%",
        transform: "rotate(4deg) scale(0.98) translateX(-50%) translateY(-50%)",
      },
    },
    {
      number: 1238,
      title: "Implement dark mode toggle",
      isOpen: false,
      label: "high priority",
      comments: 8,
      createdAt: "1h ago",
      style: {
        top: "20%",
        left: "56%",
        transform:
          "rotate(-4deg) scale(0.89) translateX(-50%) translateY(-50%)",
      },
    },
    {
      number: 1241,
      title: "Implement OAuth login with GitHub",
      isOpen: true,
      label: "high priority",
      comments: 4,
      createdAt: "10m ago",
      style: {
        top: "85%",
        left: "19%",
        transform:
          "rotate(-5deg) scale(1.08) translateX(-50%) translateY(-50%)",
      },
    },
    {
      number: 1239,
      title: "Optimize image loading performance",
      isOpen: true,
      label: "high priority",
      comments: 1,
      createdAt: "30m ago",
      style: {
        top: "14%",
        left: "85%",
        transform:
          "rotate(-2deg) scale(1.09) translateX(-50%) translateY(-50%)",
      },
    },
    {
      number: 1240,
      title: "Fix responsive layout on mobile devices",
      isOpen: true,
      label: "bug",
      comments: 0,
      createdAt: "15m ago",
      style: {
        top: "60%",
        left: "25%",
        transform:
          "rotate(-2deg) scale(0.87) translateX(-50%) translateY(-50%)",
      },
    },
    {
      number: 1243,
      title: "Update dependencies to latest versions",
      isOpen: true,
      label: "dependencies",
      comments: 0,
      createdAt: "2m ago",
      style: {
        top: "10%",
        left: "10%",
        transform:
          "rotate(-1deg) scale(0.89) translateX(-50%) translateY(-50%)",
      },
    },
    {
      number: 1245,
      title: "Implement drag and drop for issue cards",
      isOpen: false,
      label: "wontfix",
      comments: 7,
      createdAt: "1d ago",
      style: {
        top: "30%",
        left: "24%",
        transform: "rotate(2deg) scale(0.94) translateX(-50%) translateY(-50%)",
      },
    },
    {
      number: 1246,
      title: "Fix memory leak in component unmount",
      isOpen: true,
      label: "bug",
      comments: 3,
      createdAt: "3d ago",
      style: {
        top: "55%",
        left: "51%",
        transform:
          "rotate(-5deg) scale(0.93) translateX(-50%) translateY(-50%)",
      },
    },
    {
      number: 1247,
      title: "Add pagination to results table",
      isOpen: true,
      label: "bug",
      comments: 5,
      createdAt: "4d ago",
      style: {
        top: "87%",
        left: "43%",
        transform:
          "rotate(-2deg) scale(1.06) translateX(-50%) translateY(-50%)",
      },
    },
    {
      number: 1248,
      title: "Implement server-side caching",
      isOpen: true,
      label: "wontfix",
      comments: 2,
      createdAt: "1w ago",
      style: {
        top: "57%",
        left: "16%",
        transform: "rotate(2deg) scale(1.11) translateX(-50%) translateY(-50%)",
      },
    },
    {
      number: 1249,
      title: "Add i18n support for multiple languages",
      isOpen: false,
      label: "feature",
      comments: 9,
      createdAt: "2w ago",
      style: {
        top: "80%",
        left: "20%",
        transform:
          "rotate(-5deg) scale(1.14) translateX(-50%) translateY(-50%)",
      },
    },
    {
      number: 1250,
      title: "Fix accessibility issues in form components",
      isOpen: true,
      label: "accessibility",
      comments: 4,
      createdAt: "3w ago",
      style: {
        top: "87%",
        left: "31%",
        transform: "rotate(0deg) scale(0.91) translateX(-50%) translateY(-50%)",
      },
    },
    {
      number: 1251,
      title: "Implement CI/CD pipeline",
      isOpen: true,
      label: "devops",
      comments: 6,
      createdAt: "1mo ago",
      style: {
        top: "81%",
        left: "53%",
        transform: "rotate(4deg) scale(0.90) translateX(-50%) translateY(-50%)",
      },
    },
  ] as const;

  return (
    <div className="flex flex-col items-center justify-between min-h-screen relative overflow-hidden">
      <GridBackground />

      <Link
        href="/"
        className="md:fixed z-10 top-0 left-0 p-4 items-center flex gap-4"
      >
        <Image
          width={64}
          height={64}
          src="/logo.svg"
          alt="logo"
          className="size-10"
        />
      </Link>

      <div className="absolute inset-0 top-1/2 w-full min-w-4xl overflow-hidden pointer-events-none opacity-75">
        {issues.map(({ style, ...issue }, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              ...style,
              opacity: 0,
              animation: "fadeIn 1s ease forwards",
              animationDelay: `${i * 1}s`,
            }}
          >
            <GitHubIssue {...issue} />
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center md:justify-center text-center px-4 py-20 max-w-2xl mx-auto z-10 flex-1">
        {children}
      </div>
    </div>
  );
}
