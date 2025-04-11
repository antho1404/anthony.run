import { NextRequest, NextResponse } from "next/server";
import { saveInstallationId } from "@/lib/github";
import { auth } from "@clerk/nextjs";

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { installationId } = await req.json();
  
  if (!installationId || typeof installationId !== "number") {
    return NextResponse.json({ error: "Invalid installation ID" }, { status: 400 });
  }
  
  try {
    await saveInstallationId(installationId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving installation ID:", error);
    return NextResponse.json(
      { error: "Failed to save installation ID" },
      { status: 500 }
    );
  }
}