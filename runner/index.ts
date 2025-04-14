import { execSync } from "child_process";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";

interface Logger {
  log: (output: unknown) => Promise<void>;
  error: (error: Error) => Promise<void>;
}

function buildLogger({
  endpoint,
  runId: id,
}: {
  endpoint: URL;
  runId: string;
}): Logger {
  const opts = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  };
  return {
    log: async (output: unknown) => {
      await fetch(endpoint, {
        ...opts,
        body: JSON.stringify({ id, output }),
      });
    },
    error: async (error: Error) => {
      await fetch(endpoint, {
        ...opts,
        body: JSON.stringify({ id, error: error.message || "Unknown error" }),
      });
    },
  };
}

async function main({
  repoUrl,
  branch,
  prompt,
  logger,
}: {
  repoUrl: URL;
  prompt: string;
  branch: string;
  logger: Logger;
}) {
  const tmpDir = mkdtempSync(tmpdir());

  try {
    console.log("Cloning repository...");
    execSync(`git clone ${repoUrl} ${tmpDir}`, { stdio: "inherit" });

    process.chdir(tmpDir);
    console.log("Checking out branch...");
    execSync(`git checkout -b ${branch}`, { stdio: "inherit" });

    console.log("Running Claude...");
    const stdio = execSync(
      `claude --print --json "${prompt}" --allowedTools "Bash(git commit:*),Bash(git add:*),Edit,Write"`,
      { stdio: "pipe" }
    );

    const output = JSON.parse(stdio.toString());

    console.log("Pushing changes to GitHub...");
    execSync(`git push origin ${branch}`, { stdio: "inherit" });

    await logger.log(output);
  } catch (error) {
    await logger.error(error as Error);
    process.exit(1);
  } finally {
    process.chdir("/");
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

main({
  repoUrl: new URL(process.argv[2]),
  prompt: process.argv[3],
  branch: process.argv[4],
  logger: buildLogger({
    endpoint: new URL(process.argv[5]),
    runId: process.argv[6],
  }),
})
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
