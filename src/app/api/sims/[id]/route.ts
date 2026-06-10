import { NextResponse, type NextRequest } from "next/server";
import { requireManagerApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/sims/[id]">) {
  const auth = await requireManagerApi();
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;
  const sim = await prisma.sim.findUnique({ where: { id }, include: { operator: true, assignedVendor: true, order: true } });
  return sim ? NextResponse.json(sim) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/sims/[id]">) {
  const auth = await requireManagerApi();
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;
  const body = await request.json();
  const sim = await prisma.sim.update({ where: { id }, data: body });
  return NextResponse.json(sim);
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/sims/[id]">) {
  const auth = await requireManagerApi();
  if ("error" in auth) return auth.error;
  const { id } = await ctx.params;
  await prisma.sim.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
