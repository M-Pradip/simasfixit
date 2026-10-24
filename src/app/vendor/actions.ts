"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireVendorSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUpload, validateUpload } from "@/lib/upload";

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

  const subtotal = operator.simCost * quantity;
  if (!Number.isSafeInteger(subtotal)) {
    throw new Error("Order total is too large");
  }
  if (commissionUsed > subtotal) {
    throw new Error("Balance points cannot exceed the order subtotal");
  }

  const screenshotValue = formData.get("paymentScreenshot");
  const screenshot = screenshotValue instanceof File && screenshotValue.size > 0
    ? screenshotValue
    : null;
  if (screenshot && paymentMethod.type !== "ONLINE") {
    throw new Error("Payment screenshots are only accepted for QR/online payments");
  }
  if (screenshot) validateUpload("payment-proof", screenshot);
  const paymentScreenshotUrl = screenshot
    ? await saveUpload("payment-proof", screenshot)
    : null;

  await prisma.$transaction(async (tx) => {
    let updatedVendor = vendor;
    if (commissionUsed > 0) {
      const debit = await tx.vendor.updateMany({
        where: { id: vendor.id, balance: { gte: commissionUsed } },
        data: { balance: { decrement: commissionUsed } },
      });
      if (debit.count !== 1) {
        throw new Error("Not enough balance points remain for this order");
      }
      updatedVendor = await tx.vendor.findUniqueOrThrow({ where: { id: vendor.id } });
    }

    const order = await tx.order.create({
      data: {
      reference: `ORD-${Date.now().toString().slice(-6)}`,
      vendorId: vendor.id,
      operatorId: operator.id,
      quantity,
      simUnitCost: operator.simCost,
      subtotal,
      amountDue: subtotal - commissionUsed,
      paymentScreenshotUrl,
      paymentMethod: paymentMethod.type,
      commissionUsed,
      },
    });

    if (commissionUsed > 0) {
      await tx.balanceLedger.create({
        data: {
          vendorId: vendor.id,
          type: "COMMISSION_WITHDRAWAL",
          amount: -commissionUsed,
          runningBalance: updatedVendor.balance,
          note: `Balance points applied to order ${order.reference}`,
          orderId: order.id,
        },
      });
    }
  });

  revalidatePath("/vendor/orders");
  revalidatePath("/admin/orders");
  redirect("/vendor/orders");
}
