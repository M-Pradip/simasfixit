"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireVendorSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function requiredString(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
}

export async function createVendorOrder(formData: FormData) {
  const session = await requireVendorSession();
  const vendor = await prisma.vendor.findUniqueOrThrow({ where: { id: session.id } });

  if (vendor.balance < 0) {
    throw new Error("Vendor balance must be cleared before ordering");
  }

  const operatorId = requiredString(formData, "operatorId");
  const paymentMethodId = requiredString(formData, "paymentMethodId");
  const quantity = Number(requiredString(formData, "quantity"));
  const commissionUsed = Number(String(formData.get("commissionUsed") ?? "0").trim() || "0");

  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be a positive whole number");
  }

  if (!Number.isSafeInteger(commissionUsed) || commissionUsed < 0 || commissionUsed > Math.max(vendor.balance, 0)) {
    throw new Error("Commission used must be a valid available balance amount");
  }

  const [operator, paymentMethod] = await Promise.all([
    prisma.operator.findFirst({ where: { id: operatorId, status: "ACTIVE" } }),
    prisma.paymentMethod.findFirst({ where: { id: paymentMethodId, active: true } }),
  ]);

  if (!operator) {
    throw new Error("Selected operator is not active");
  }

  if (!paymentMethod) {
    throw new Error("Selected payment method is not active");
  }

  await prisma.order.create({
    data: {
      reference: `ORD-${Date.now().toString().slice(-6)}`,
      vendorId: vendor.id,
      operatorId: operator.id,
      quantity,
      paymentMethod: paymentMethod.type,
      commissionUsed,
    },
  });

  revalidatePath("/vendor/orders");
  revalidatePath("/admin/orders");
  redirect("/vendor/orders");
}
