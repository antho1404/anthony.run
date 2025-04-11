import { generateToken } from "@/lib/github";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function run({
  repoUrl,
  prompt,
  branch,
}: {
  repoUrl: string;
  prompt: string;
  branch: string;
}) {
  const token = await generateToken();

  const url = new URL(repoUrl.toString());
  url.username = "x-access-token";
  url.password = token;

  const cmd = `docker run --rm -e ANTHROPIC_API_KEY="${process.env.ANTHROPIC_API_KEY}" claude-runner "${url}" "${prompt}" "${branch}"`;

  const { stdout, stderr } = await execAsync(cmd);
  if (stderr) console.error(stderr);
  console.log(stdout);
}
