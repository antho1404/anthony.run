import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { run } from "@/lib/runner";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project to name *",
  description:
    "Get ready for a revolutionary app designed to transform issues into ready-to-merge pull requests — saving your team up to 90% of development time.",
};

export default async function Dashboard() {
  return (
    <form
      action={async (formData) => {
        "use server";
        const repoUrl = formData.get("repoUrl");
        if (!repoUrl) throw new Error("Invalid repo URL");
        const prompt = formData.get("prompt");
        if (!prompt) throw new Error("Invalid prompt");
        const branch = formData.get("branch");
        if (!branch) throw new Error("Invalid branch");
        await run({
          repoUrl: repoUrl.toString(),
          prompt: prompt.toString(),
          branch: branch.toString(),
        });
      }}
      className="flex flex-col gap-2 w-full max-w-4xl mx-auto my-12 space-y-4"
    >
      <Input
        type="text"
        name="repoUrl"
        defaultValue="https://github.com/antho1404/project-to-name"
      />
      <Input type="text" name="branch" defaultValue="feature/countdown" />
      <Textarea
        name="prompt"
        defaultValue="Add a countdown to end in May 1st to announce the official launch. In terms of design make it with really large characters and in opacity in the background on the top of the screen, make it bold and make it in a way that it's not too intrusive but still visible."
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}

// https://github.com/apps/project-to-name/installations/select_target
