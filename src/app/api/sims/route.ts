import { NextResponse, type NextRequest } from "next/server";
import { requireManagerApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireManagerApi();
  if ("error" in auth) return auth.error;

  const sims = await prisma.sim.findMany({
    include: { operator: true, assignedVendor: true, order: true },
    orderBy: { number: "asc" },
    take: 200,
  });

  return NextResponse.json(sims);
}

export async function POST(request: NextRequest) {
  const auth = await requireManagerApi();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const sim = await prisma.sim.create({
    data: {
      number: String(body.number),
      operatorId: String(body.operatorId),
    },
  });

  return NextResponse.json(sim, { status: 201 });
}
