"use server";
import { actionClient } from "@/app/actions/action";
import { getAccountRepositoriesByInstallationIds } from "@/lib/github";
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

    if (!user)
      returnValidationErrors(schema, {
        _errors: ["Unauthorized"],
      });

    const installations = await getAccountRepositoriesByInstallationIds(
      user.privateMetadata.githubInstallationIds || []
    );
    const installation = installations.find((i) =>
      i.repositories.find((x) => x.full_name === repo)
    );
    if (!installation)
      returnValidationErrors(schema, {
        repo: { _errors: ["Repository not found"] },
      });

    if (!installation.account)
      returnValidationErrors(schema, {
        repo: { _errors: ["Github account not found"] },
      });

    const repository = installation.repositories.find(
      (r) => r.full_name === repo
    );
    if (!repository)
      returnValidationErrors(schema, {
        repo: { _errors: ["Repository not found"] },
      });

    const run = await processIssueOrComment({
      issue: { number: issue },
      repository: { id: repository.id },
      sender: { id: installation.account.id },
      installation: { id: installation.installationId },
    });

    redirect(`/dashboard/runs/${run.id}`);
  });
