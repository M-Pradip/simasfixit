import { NextResponse, type NextRequest } from "next/server";
import { requireManagerApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/orders/[id]">) {
  const auth = await requireManagerApi();
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;
  const order = await prisma.order.findUnique({ where: { id }, include: { vendor: true, operator: true, sims: true } });
  return order ? NextResponse.json(order) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/orders/[id]">) {
  const auth = await requireManagerApi();
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;
  const body = await request.json();
  const order = await prisma.order.update({ where: { id }, data: body });
  await prisma.orderStatusEvent.create({ data: { orderId: id, toStatus: order.status, adminUserId: auth.session.id, note: "Order updated by admin" } });
  return NextResponse.json(order);
}
