import { execSync } from "child_process";
import { existsSync, mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";

function detectLintCommand(repoPath: string): string | null {
  try {
    // Check for package.json and if it contains lint commands
    if (existsSync(`${repoPath}/package.json`)) {
      const packageJson = JSON.parse(
        execSync(`cat ${repoPath}/package.json`, { stdio: "pipe" }).toString()
      );
      
      if (packageJson.scripts && packageJson.scripts.lint) {
        return "npm run lint";
      }
    }

    // Check for common linting configs
    if (
      existsSync(`${repoPath}/.eslintrc`) ||
      existsSync(`${repoPath}/.eslintrc.js`) ||
      existsSync(`${repoPath}/.eslintrc.json`) ||
      existsSync(`${repoPath}/eslint.config.js`) ||
      existsSync(`${repoPath}/eslint.config.mjs`)
    ) {
      return "npx eslint . --fix";
    }

    // Check for prettier config
    if (
      existsSync(`${repoPath}/.prettierrc`) ||
      existsSync(`${repoPath}/.prettierrc.js`) ||
      existsSync(`${repoPath}/.prettierrc.json`)
    ) {
      return "npx prettier --write .";
    }

    return null;
  } catch (error) {
    console.error("Error detecting lint command:", error);
    return null;
  }
}

function runLinter(lintCommand: string): void {
  try {
    console.log(`Running linter: ${lintCommand}`);
    execSync(lintCommand, { stdio: "inherit" });
    
    // Check if there are any changes after linting
    const hasChanges = execSync("git status --porcelain", { 
      stdio: "pipe" 
    }).toString().trim().length > 0;
    
    if (hasChanges) {
      console.log("Committing linting changes...");
      execSync("git add .", { stdio: "inherit" });
      execSync('git commit -m "Apply linting fixes"', { stdio: "inherit" });
    }
  } catch (error) {
    console.error("Linting failed, but continuing with the process:", error);
  }
}

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

    console.log("Running Agent...");
    const stdio = execSync(
      `claude --print --output-format json "${prompt}" --allowedTools "Bash(git commit:*),Bash(git add:*),Bash(git rm:*),Edit,Write"`,
      { stdio: "pipe" }
    );

    const output = JSON.parse(stdio.toString());

    // Detect and run linter after code changes
    const lintCommand = detectLintCommand(tmpDir);
    if (lintCommand) {
      runLinter(lintCommand);
    } else {
      console.log("No linter configuration detected in the repository");
    }

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
