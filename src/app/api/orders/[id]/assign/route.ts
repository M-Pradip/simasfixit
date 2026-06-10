import { NextResponse, type NextRequest } from "next/server";
import { requireManagerApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, ctx: RouteContext<"/api/orders/[id]/assign">) {
  const auth = await requireManagerApi();
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;
  const { startNumber, endNumber } = await request.json();
  const order = await prisma.order.findUniqueOrThrow({ where: { id } });

  const sims = await prisma.sim.findMany({
    where: {
      operatorId: order.operatorId,
      status: "ACTIVE",
      number: { gte: String(startNumber), lte: String(endNumber) },
    },
    orderBy: { number: "asc" },
  });

  if (sims.length !== order.quantity) {
    return NextResponse.json({ error: "Range count must match order quantity and be available" }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.sim.updateMany({
      where: { id: { in: sims.map((sim) => sim.id) } },
      data: { status: "ASSIGNED", assignedVendorId: order.vendorId, orderId: order.id },
    }),
    prisma.order.update({
      where: { id },
      data: { status: "ASSIGNED", assignedStartNumber: String(startNumber), assignedEndNumber: String(endNumber), assignedAt: new Date() },
    }),
    prisma.orderStatusEvent.create({
      data: { orderId: id, fromStatus: order.status, toStatus: "ASSIGNED", adminUserId: auth.session.id, note: `Assigned ${startNumber}-${endNumber}` },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
