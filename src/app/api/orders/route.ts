import { NextResponse, type NextRequest } from "next/server";
import { requireAdminApi, requireVendorApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAdminApi();
  if ("error" in auth) return auth.error;
  const orders = await prisma.order.findMany({ include: { vendor: true, operator: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const auth = await requireVendorApi();
  if ("error" in auth) return auth.error;

  const vendor = await prisma.vendor.findUniqueOrThrow({ where: { id: auth.session.id } });
  if (vendor.balance < 0) {
    return NextResponse.json({ error: "Vendor balance must be cleared before ordering" }, { status: 409 });
  }

  const body = await request.json();
  const order = await prisma.order.create({
    data: {
      reference: `ORD-${Date.now().toString().slice(-6)}`,
      vendorId: vendor.id,
      operatorId: String(body.operatorId),
      quantity: Number(body.quantity),
      paymentMethod: body.paymentMethod === "ONLINE" ? "ONLINE" : "COD",
      commissionUsed: Number(body.commissionUsed ?? 0),
    },
  });

  return NextResponse.json(order, { status: 201 });
}
