"use client";

import { createRunAction } from "@/app/actions/run";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { useQuery } from "@tanstack/react-query";
import { GithubIcon, Loader2Icon, PlayIcon, PlusIcon } from "lucide-react";
import { use } from "react";
import { z } from "zod";

interface RepoIssueFormProps {
  installationsPromise: Promise<
    {
      installationId: number;
      repositories: { id: number; full_name: string }[];
    }[]
  >;
}

export default function RepoIssueForm({
  installationsPromise,
}: RepoIssueFormProps) {
  const installations = use(installationsPromise);

  const { form, handleSubmitWithAction } = useHookFormAction(
    createRunAction,
    zodResolver(
      z.object({
        repo: z.string(),
        issue: z.coerce.number(),
      })
    )
  );

  const repo = form.watch("repo");
  const issue = form.watch("issue");

  const issues = useQuery({
    queryKey: ["issues", { repo }],
    queryFn: async () => {
      const response = await fetch(`/api/github/issues?repo=${repo}`);
      if (!response.ok) throw new Error("Failed to fetch issues");
      const data = await response.json();
      return data.issues as Array<{
        id: number;
        number: number;
        title: string;
      }>;
    },
    enabled: !!repo,
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmitWithAction} className="space-y-6">
        <div className="flex w-full gap-2 items-end">
          <FormField
            control={form.control}
            name="repo"
            render={({ field: { onBlur, ref, onChange, ...field } }) => (
              <FormItem className="flex-1">
                <FormLabel>Repository</FormLabel>
                <Select onValueChange={onChange} defaultValue={repo} {...field}>
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue
                        placeholder="Select a repository"
                        onBlur={onBlur}
                        ref={ref}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {installations.map((installation) =>
                      installation.repositories.map((repo) => (
                        <SelectItem key={repo.id} value={repo.full_name}>
                          <GithubIcon />
                          {repo.full_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="button" asChild variant="outline">
            <a
              href={`https://github.com/apps/${
                process.env.NEXT_PUBLIC_GITHUB_APP_NAME || ""
              }/installations/select_target`}
            >
              <PlusIcon />
              Add account
            </a>
          </Button>
        </div>

        <FormField
          control={form.control}
          name="issue"
          disabled={!repo || issues.isLoading || !!issues.error}
          render={({ field: { onBlur, value, ref, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Issue</FormLabel>
              <Select
                onValueChange={onChange}
                defaultValue={String(issue || "")}
                disabled={field.disabled}
                value={String(value || "")}
                {...field}
              >
                <FormControl className="w-full">
                  <SelectTrigger>
                    <div className="flex items-center justify-between w-full">
                      <SelectValue
                        placeholder="Select an issue"
                        onBlur={onBlur}
                        ref={ref}
                      />
                      {issues.isLoading && (
                        <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(issues.data || []).map((issue) => (
                    <SelectItem key={issue.id} value={String(issue.number)}>
                      #{issue.number} {issue.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full" type="submit">
          <PlayIcon />
          Create Run
        </Button>
      </form>
    </Form>
  );
}
