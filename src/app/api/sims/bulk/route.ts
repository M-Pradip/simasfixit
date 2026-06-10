import { NextResponse, type NextRequest } from "next/server";
import { requireManagerApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const auth = await requireManagerApi();
  if ("error" in auth) return auth.error;

  const { startNumber, endNumber, operatorId } = await request.json();
  const start = Number(startNumber);
  const end = Number(endNumber);

  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || end < start || end - start > 5000) {
    return NextResponse.json({ error: "Invalid range" }, { status: 400 });
  }

  const result = await prisma.sim.createMany({
    data: Array.from({ length: end - start + 1 }, (_, index) => ({
      number: String(start + index),
      operatorId: String(operatorId),
    })),
    skipDuplicates: true,
  });

  return NextResponse.json(result, { status: 201 });
}
