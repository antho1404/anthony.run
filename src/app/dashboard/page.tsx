import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { run } from "@/lib/runner";
import { getInstallationId, getUserRepositories, saveInstallationId } from "@/lib/github";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Project to name * Dashboard",
  description:
    "Get ready for a revolutionary app designed to transform issues into ready-to-merge pull requests — saving your team up to 90% of development time.",
};

export default async function Dashboard() {
  const { userId } = auth();
  const user = await currentUser();
  
  if (!userId || !user) {
    redirect("/sign-in");
  }
  
  const installationId = await getInstallationId();
  let repositories: any[] = [];
  
  if (installationId) {
    try {
      repositories = await getUserRepositories();
    } catch (error) {
      console.error("Error fetching repositories:", error);
    }
  }
  
  async function handleSetupWebhook(formData: FormData) {
    "use server";
    const installationId = formData.get("installationId");
    if (!installationId) throw new Error("Invalid installation ID");
    
    await saveInstallationId(Number(installationId));
    // Redirect to refresh the page
    redirect("/dashboard");
  }
  
  async function handleRunPrompt(formData: FormData) {
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
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {!installationId ? (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-amber-800 mb-2">GitHub App Setup Required</h2>
          <p className="mb-4">To use this application, you need to install the GitHub App and configure the webhook.</p>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Step 1: Install the GitHub App</h3>
              <a 
                href="https://github.com/apps/project-to-name/installations/select_target"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Install GitHub App
              </a>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Step 2: Configure Webhook</h3>
              <form action={handleSetupWebhook} className="space-y-4">
                <div>
                  <label htmlFor="installationId" className="block text-sm font-medium mb-1">Installation ID</label>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      id="installationId" 
                      name="installationId" 
                      placeholder="Enter your GitHub App installation ID"
                      required
                    />
                    <Button type="submit">Save</Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Find your installation ID in the URL after installing the app: https://github.com/settings/installations/[YOUR_INSTALLATION_ID]
                  </p>
                </div>
              </form>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Step 3: Set Up Webhook in GitHub</h3>
              <p className="text-sm text-gray-600 mb-2">Configure a webhook in your GitHub repository with these settings:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 ml-2 space-y-1">
                <li><strong>Payload URL:</strong> https://your-app-url.com/api/github/webhook</li>
                <li><strong>Content type:</strong> application/json</li>
                <li><strong>Secret:</strong> Create a secure secret and add it to your environment variables</li>
                <li><strong>Events:</strong> Select at minimum "Installation" and "Repository"</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">✅ GitHub App installed successfully (Installation ID: {installationId})</p>
          </div>
          
          <div className="bg-white border rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Run Prompt on Repository</h2>
            
            <form action={handleRunPrompt} className="space-y-4">
              <div>
                <label htmlFor="repoSelect" className="block text-sm font-medium mb-1">Repository</label>
                {repositories.length > 0 ? (
                  <div className="flex gap-2">
                    <Select name="repoUrl">
                      <SelectTrigger id="repoSelect" className="w-full">
                        <SelectValue placeholder="Select a repository" />
                      </SelectTrigger>
                      <SelectContent>
                        {repositories.map((repo) => (
                          <SelectItem key={repo.id} value={repo.html_url}>
                            {repo.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <Input
                    type="text"
                    id="repoUrl"
                    name="repoUrl"
                    placeholder="https://github.com/username/repo"
                    defaultValue="https://github.com/antho1404/project-to-name"
                  />
                )}
              </div>
              
              <div>
                <label htmlFor="branch" className="block text-sm font-medium mb-1">Branch</label>
                <Input 
                  type="text" 
                  id="branch" 
                  name="branch" 
                  placeholder="main"
                  defaultValue="feature/countdown" 
                />
              </div>
              
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium mb-1">Prompt</label>
                <Textarea
                  id="prompt"
                  name="prompt"
                  rows={5}
                  placeholder="Enter your prompt..."
                  defaultValue="Add a countdown to end in May 1st to announce the official launch. In terms of design make it with really large characters and in opacity in the background on the top of the screen, make it bold and make it in a way that it's not too intrusive but still visible."
                />
              </div>
              
              <Button type="submit" className="w-full">Run Prompt</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
