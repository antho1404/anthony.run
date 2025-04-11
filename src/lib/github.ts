import { auth } from "@clerk/nextjs";
import { Octokit } from "@octokit/core";
import jwt from "jsonwebtoken";

const GITHUB_APP_ID = process.env.GITHUB_APP_ID;
const GITHUB_APP_PRIVATE_KEY = process.env.GITHUB_APP_PRIVATE_KEY;
const GITHUB_APP_CLIENT_ID = process.env.GITHUB_APP_CLIENT_ID;
const GITHUB_APP_CLIENT_SECRET = process.env.GITHUB_APP_CLIENT_SECRET;

// Generate JWT for GitHub App
export function generateAppJWT() {
  if (!GITHUB_APP_ID || !GITHUB_APP_PRIVATE_KEY) {
    throw new Error('GitHub App credentials not configured');
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now,
    exp: now + 10 * 60, // JWT expiration time (10 minutes)
    iss: GITHUB_APP_ID,
  };

  return jwt.sign(payload, GITHUB_APP_PRIVATE_KEY, { algorithm: 'RS256' });
}

// Get an installation token for the authenticated user
export async function generateToken() {
  const { userId } = auth();
  if (!userId) {
    throw new Error('User not authenticated');
  }
  
  // Use the JWT to authenticate as the GitHub App
  const appJWT = generateAppJWT();
  const octokit = new Octokit({ auth: appJWT });
  
  // Get the installation ID from user metadata
  const installationId = await getInstallationId();
  if (!installationId) {
    throw new Error('GitHub App not installed for this user');
  }
  
  // Get an installation token
  const response = await octokit.request('POST /app/installations/{installation_id}/access_tokens', {
    installation_id: installationId,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  
  return response.data.token;
}

// Get the GitHub App installation ID from Clerk user metadata
export async function getInstallationId(): Promise<number | null> {
  const { userId } = auth();
  if (!userId) return null;
  
  // This would normally fetch from Clerk's user metadata
  // For now, we'll implement a placeholder
  // In a real implementation, you would fetch this from Clerk
  const metadata = await fetchUserMetadata(userId);
  return metadata?.githubInstallationId || null;
}

// Save GitHub installation ID to user metadata
export async function saveInstallationId(installationId: number): Promise<void> {
  const { userId } = auth();
  if (!userId) throw new Error('User not authenticated');
  
  // This would normally update Clerk's user metadata
  // In a real implementation, you would update this in Clerk
  await updateUserMetadata(userId, { githubInstallationId: installationId });
}

// Placeholder for fetching user metadata
async function fetchUserMetadata(userId: string): Promise<any> {
  // In a real implementation, you would fetch this from Clerk
  // For example: const user = await clerkClient.users.getUser(userId);
  // return user.privateMetadata;
  return {}; // Placeholder
}

// Placeholder for updating user metadata
async function updateUserMetadata(userId: string, metadata: any): Promise<void> {
  // In a real implementation, you would update this in Clerk
  // For example: await clerkClient.users.updateUser(userId, { privateMetadata: metadata });
  console.log('Updating metadata for user', userId, metadata);
}

// Get repositories accessible to the authenticated user
export async function getUserRepositories() {
  const token = await generateToken();
  const octokit = new Octokit({ auth: token });
  
  const response = await octokit.request('GET /installation/repositories', {
    headers: {
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  
  return response.data.repositories;
}