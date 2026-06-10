"use server";

import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["DISPATCHED", "CANCELLED"],
  DISPATCHED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const TIMESTAMP_FIELD: Partial<Record<OrderStatus, string>> = {
  ASSIGNED: "assignedAt",
  DISPATCHED: "dispatchedAt",
  DELIVERED: "deliveredAt",
};

export async function changeOrderStatus(
  orderId: string,
  currentStatus: OrderStatus,
  newStatus: OrderStatus,
  note?: string,
) {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];

  if (!allowed.length) {
    return { error: "This order is locked and cannot be updated." };
  }
  if (!allowed.includes(newStatus)) {
    return {
      error: `Cannot transition from ${currentStatus} to ${newStatus}.`,
    };
  }

  const timestampField = TIMESTAMP_FIELD[newStatus];

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        ...(timestampField ? { [timestampField]: new Date() } : {}),
      },
    }),
    prisma.orderStatusEvent.create({
      data: {
        orderId,
        fromStatus: currentStatus,
        toStatus: newStatus,
        note: note?.trim() || null,
      },
    }),
  ]);

  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}
