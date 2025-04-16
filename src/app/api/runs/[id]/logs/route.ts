import { getContainerLogs, isContainerRunning } from "@/lib/docker";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const run = await prisma.run.findUnique({
      where: { 
        id: params.id,
        userId 
      },
    });

    if (!run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    // If no container ID, return output from the database
    if (!run.containerId) {
      return NextResponse.json({ 
        logs: run.output || "",
        isRunning: false,
        run
      });
    }

    // Check if container is still running
    const isRunning = await isContainerRunning(run.containerId);

    // If container is running, fetch logs from Docker
    let logs = run.output || "";
    if (isRunning) {
      try {
        logs = await getContainerLogs(run.containerId);
      } catch (error) {
        console.error("Error fetching container logs:", error);
      }
    }

    return NextResponse.json({
      logs,
      isRunning,
      run
    });
  } catch (error) {
    console.error("Error fetching run logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch run logs" },
      { status: 500 }
    );
  }
}