import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function run({
  repoUrl,
  prompt,
  branch,
}: {
  repoUrl: URL;
  prompt: string;
  branch: string;
}) {
  const cmd = `docker run --rm -d -e ANTHROPIC_API_KEY="${
    process.env.ANTHROPIC_API_KEY
  }" claude-runner "${repoUrl.toString()}" "${prompt}" "${branch}"`;

  const { stdout, stderr } = await execAsync(cmd);
  if (stderr) console.error(stderr);
  console.log(stdout);
}
