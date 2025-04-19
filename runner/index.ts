import { execSync } from "child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

/**
 * Detects available lint commands in package.json and returns them as a formatted string
 * to be added to the prompt for Claude.
 */
function detectLintCommands(repoPath: string): string {
  try {
    const packageJsonPath = join(repoPath, "package.json");
    
    if (!existsSync(packageJsonPath)) {
      return "NOTE: No package.json found in the repository.";
    }
    
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    const scripts = packageJson.scripts || {};
    
    // Collect all lint-related scripts
    const lintCommands = Object.entries(scripts)
      .filter(([name]) => 
        name === "lint" || 
        name.includes("lint") || 
        name === "typecheck" || 
        name.includes("format") ||
        name.includes("eslint") ||
        name.includes("tsc")
      )
      .map(([name, command]) => `npm run ${name}: ${command}`);
    
    if (lintCommands.length === 0) {
      return "NOTE: No lint-related commands found in package.json scripts.";
    }
    
    return `
Available lint commands in this repository:
${lintCommands.join("\n")}

IMPORTANT: You MUST run these commands before committing any changes.
`;
  } catch (error) {
    console.error("Error detecting lint commands:", error);
    return "NOTE: Failed to detect lint commands.";
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
    
    // Detect available lint commands and append to the prompt
    const lintCommands = detectLintCommands(tmpDir);
    console.log("Detected lint commands:", lintCommands);
    
    // Add linting instructions to the prompt
    const enhancedPrompt = `${prompt}

${lintCommands}

IMPORTANT: Before committing any changes, you MUST run all available lint commands (npm run lint, etc.) and fix any issues.`;

    console.log("Running Agent...");
    const stdio = execSync(
      `claude --print --output-format json "${enhancedPrompt}" --allowedTools "Bash(git commit:*),Bash(git add:*),Bash(git rm:*),Bash(npm:*),Edit,Write"`,
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
