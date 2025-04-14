import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // TODO: add hmac security
  const body = (await req.json()) satisfies {
    id: string;
    error?: string;
    output?: {
      cost_usd: number;
      duration_api_ms: number;
      duration_ms: number;
      result: string;
      role: string;
    };
  };

  await prisma.run.update({
    where: { id: body.id },
    data: { output: JSON.stringify(body.output) },
  });

  return NextResponse.json({ success: true });
}
