import { NextRequest, NextResponse } from "next/server";
import { saveInstallationId } from "@/lib/github";

// GitHub webhook secret for verifying requests
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const signature = req.headers.get("x-hub-signature-256");
  
  // In a production app, you would verify the signature here
  // This would use the WEBHOOK_SECRET to ensure the request is coming from GitHub
  
  // Handle different event types
  const event = req.headers.get("x-github-event");
  
  if (event === "installation") {
    // Handle installation events
    if (payload.action === "created" || payload.action === "added") {
      const installationId = payload.installation.id;
      const accountId = payload.installation.account.id;
      const accountLogin = payload.installation.account.login;
      
      console.log(`GitHub App installed by ${accountLogin} (ID: ${accountId}) with installation ID ${installationId}`);
      
      // Here, you would typically associate the installation with the user in your database
      // For now, we'll just log it
    }
  }
  
  return NextResponse.json({ success: true });
}