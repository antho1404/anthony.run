import { execSync } from "child_process";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

/**
 * Detects if a project uses a linter by checking for common linting configurations
 * @param projectPath Path to the project directory
 * @returns Object indicating if linter is detected and its type
 */
function detectLinter(projectPath: string): { usesLinter: boolean; linterType: string | null } {
  try {
    // Check for ESLint configuration files
    const eslintConfigFiles = [
      ".eslintrc",
      ".eslintrc.js",
      ".eslintrc.json",
      ".eslintrc.yml",
      ".eslintrc.yaml",
    ];
    
    for (const configFile of eslintConfigFiles) {
      if (existsSync(join(projectPath, configFile))) {
        return { usesLinter: true, linterType: "eslint" };
      }
    }
    
    // Check for Prettier configuration files
    const prettierConfigFiles = [
      ".prettierrc",
      ".prettierrc.js",
      ".prettierrc.json",
      ".prettierrc.yml",
      ".prettierrc.yaml",
      "prettier.config.js",
    ];
    
    for (const configFile of prettierConfigFiles) {
      if (existsSync(join(projectPath, configFile))) {
        return { usesLinter: true, linterType: "prettier" };
      }
    }
    
    // Check package.json for linting scripts and dependencies
    if (existsSync(join(projectPath, "package.json"))) {
      const packageJson = JSON.parse(
        readFileSync(join(projectPath, "package.json"), "utf-8")
      );
      
      // Check for linting scripts
      if (packageJson.scripts) {
        if (packageJson.scripts.lint || packageJson.scripts.eslint) {
          return { usesLinter: true, linterType: "eslint" };
        }
        if (packageJson.scripts.format || packageJson.scripts.prettier) {
          return { usesLinter: true, linterType: "prettier" };
        }
      }
      
      // Check for linting dependencies
      const allDependencies = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {}),
      };
      
      if (allDependencies.eslint) {
        return { usesLinter: true, linterType: "eslint" };
      }
      if (allDependencies.prettier) {
        return { usesLinter: true, linterType: "prettier" };
      }
    }
    
    return { usesLinter: false, linterType: null };
  } catch (error) {
    console.error("Error detecting linter:", error);
    return { usesLinter: false, linterType: null };
  }
}

/**
 * Runs the appropriate linting command based on the detected linter
 * @param projectPath Path to the project directory
 * @param linterType Type of linter detected
 */
function runLinting(projectPath: string, linterType: string): void {
  try {
    console.log(`Running ${linterType} to format code...`);
    
    if (linterType === "eslint") {
      // Try to run eslint with --fix option
      try {
        execSync("npx eslint --fix .", { 
          cwd: projectPath, 
          stdio: "inherit" 
        });
      } catch (error) {
        console.log("Failed to run eslint directly, trying with package.json script...");
        try {
          execSync("npm run lint", { 
            cwd: projectPath, 
            stdio: "inherit" 
          });
        } catch (innerError) {
          console.error("Failed to run linting script:", innerError);
        }
      }
    } else if (linterType === "prettier") {
      // Try to run prettier
      try {
        execSync("npx prettier --write .", { 
          cwd: projectPath, 
          stdio: "inherit" 
        });
      } catch (error) {
        console.log("Failed to run prettier directly, trying with package.json script...");
        try {
          execSync("npm run format", { 
            cwd: projectPath, 
            stdio: "inherit" 
          });
        } catch (innerError) {
          console.error("Failed to run formatting script:", innerError);
        }
      }
    }
  } catch (error) {
    console.error(`Error running ${linterType}:`, error);
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
      `claude --print --output-format json "${prompt}" --allowedTools "Bash(git commit:*),Bash(git add:*),Bash(git rm:*),Bash(npm:*),Edit,Write"`,
      { stdio: "pipe" }
    );

    const output = JSON.parse(stdio.toString());

    // Detect if project uses a linter
    const { usesLinter, linterType } = detectLinter(tmpDir);
    
    // Run linting if a linter is detected
    if (usesLinter && linterType) {
      console.log(`Linter detected: ${linterType}`);
      runLinting(tmpDir, linterType);
      
      // Add any changes made by the linter
      execSync("git add .", { stdio: "inherit" });
      
      // Commit linting changes if there are any
      try {
        execSync('git diff-index --quiet HEAD || git commit -m "Apply linting"', { 
          stdio: "inherit" 
        });
      } catch (error) {
        // This is expected if there are changes to commit
        console.log("Committed linting changes");
      }
    } else {
      console.log("No linter detected in the project");
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
