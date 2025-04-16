import { execSync } from "child_process";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";

async function main({
  repoUrl,
  branch,
  prompt,
  endpoint,
  runId,
}: {
  repoUrl: URL;
  prompt: string;
  branch: string;
  endpoint: URL;
  runId: string;
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
      `claude --print --json "${prompt}" --allowedTools "Bash(git commit:*),Bash(git add:*),Bash(git rm:*),Edit,Write"`,
      { stdio: "pipe" }
    );

    const output = JSON.parse(stdio.toString());

    console.log("Pushing changes to GitHub...");
    execSync(`git push origin ${branch}`, { stdio: "inherit" });

    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: runId, output }),
    });
  } catch (error) {
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: runId,
        error: (error as Error).message || "Unknown error",
      }),
    });
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
  endpoint: new URL(process.argv[5]),
  runId: process.argv[6],
})
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
