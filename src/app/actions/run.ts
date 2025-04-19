"use server";
import { actionClient } from "@/app/actions/action";
import { processIssueOrComment } from "@/lib/github/issue";
import { currentUser } from "@clerk/nextjs/server";
import { returnValidationErrors } from "next-safe-action";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  repo: z.string(),
  issue: z.coerce.number(),
});

export const createRunAction = actionClient
  .schema(schema)
  .action(async ({ parsedInput: { repo, issue } }) => {
    const user = await currentUser();
    if (!user) returnValidationErrors(schema, { _errors: ["Unauthorized"] });

    const run = await processIssueOrComment(user.id, repo, issue);

    redirect(`/dashboard/runs/${run.id}`);
  });
