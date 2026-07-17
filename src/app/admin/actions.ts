"use server";

import { getCurrentSession, isPrivilegedAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveLocalUpload } from "@/lib/upload";
import type { AdminRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

async function requirePrivilegedAdmin() {
  const session = await getCurrentSession();

  if (
    !session ||
    session.kind !== "admin" ||
    !isPrivilegedAdmin(session.role)
  ) {
    throw new Error("Forbidden");
  }

  return session;
}

function requiredString(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
}

function optionalNumber(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) return null;

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new Error(`${key} must be a positive whole number`);
  }

  return parsed;
}

function requiredEmail(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  const parsed = z.string().email().parse(value);
  return parsed;
}

function requiredRole(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return z.enum(["SUPERADMIN", "MANAGER", "SUPPORT"]).parse(value) as AdminRole;
}

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function addSingleSim(formData: FormData) {
  await requirePrivilegedAdmin();

  const data = z
    .object({
      number: z.string().min(1),
      operatorId: z.string().min(1),
    })
    .parse({
      number: requiredString(formData, "number"),
      operatorId: requiredString(formData, "operatorId"),
    });

  await prisma.sim.create({ data });
  revalidatePath("/admin/sims");
}

export async function addSimRange(formData: FormData) {
  await requirePrivilegedAdmin();

  const start = Number(requiredString(formData, "startNumber"));
  const end = Number(requiredString(formData, "endNumber"));
  const operatorId = requiredString(formData, "operatorId");

  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    end < start ||
    end - start > 5000
  ) {
    throw new Error(
      "SIM range must be valid and contain 5000 numbers or fewer",
    );
  }

  await prisma.sim.createMany({
    data: Array.from({ length: end - start + 1 }, (_, index) => ({
      number: String(start + index),
      operatorId,
    })),
    skipDuplicates: true,
  });

  revalidatePath("/admin/sims");
}

export async function adjustVendorBalance(formData: FormData) {
  const session = await requirePrivilegedAdmin();
  const vendorId = requiredString(formData, "vendorId");
  const note = requiredString(formData, "note");
  const amount = Number(requiredString(formData, "amount"));

  if (!Number.isSafeInteger(amount) || amount === 0) {
    throw new Error(
      "Balance adjustment amount must be a non-zero whole rupee value",
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await prisma.$transaction(async (tx: any) => {
    const vendor = await tx.vendor.update({
      where: { id: vendorId },
      data: { balance: { increment: amount } },
    });

    await tx.balanceLedger.create({
      data: {
        vendorId,
        type: "MANUAL_ADJUSTMENT",
        amount,
        runningBalance: vendor.balance,
        note,
        adminUserId: session.id,
      },
    });
  });

  revalidatePath(`/admin/vendors/${vendorId}`);
  revalidatePath("/admin/vendors");
  revalidatePath("/admin/commissions");
}

export async function updateVendorRates(formData: FormData) {
  await requirePrivilegedAdmin();

  const vendorId = requiredString(formData, "vendorId");
  await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      commissionOverride: optionalNumber(formData, "commissionOverride"),
      fineOverride: optionalNumber(formData, "fineOverride"),
    },
  });

  revalidatePath(`/admin/vendors/${vendorId}`);
  revalidatePath("/admin/vendors");
}

export async function updateOperatorDefaults(formData: FormData) {
  await requirePrivilegedAdmin();

  const operatorId = requiredString(formData, "operatorId");
  const defaultCommission = optionalNumber(formData, "defaultCommission");
  const defaultFine = optionalNumber(formData, "defaultFine");

  if (defaultCommission === null || defaultFine === null) {
    throw new Error("Default commission and fine are required");
  }

  await prisma.operator.update({
    where: { id: operatorId },
    data: { defaultCommission, defaultFine },
  });

  revalidatePath("/admin/operators");
  revalidatePath("/admin/vendors");
}

export async function toggleOperatorStatus(formData: FormData) {
  await requirePrivilegedAdmin();

  const operatorId = requiredString(formData, "operatorId");
  const status = requiredString(formData, "status");

  if (status !== "ACTIVE" && status !== "INACTIVE") {
    throw new Error("Unsupported operator status");
  }

  await prisma.operator.update({ where: { id: operatorId }, data: { status } });
  revalidatePath("/admin/operators");
  revalidatePath("/vendor/orders/new");
}

export async function togglePaymentMethodStatus(formData: FormData) {
  await requirePrivilegedAdmin();

  const paymentMethodId = requiredString(formData, "paymentMethodId");
  const active = requiredString(formData, "active") === "true";

  await prisma.paymentMethod.update({
    where: { id: paymentMethodId },
    data: { active },
  });
  revalidatePath("/admin/payment-methods");
  revalidatePath("/vendor/orders/new");
}

export async function createAdminUser(formData: FormData) {
  await requirePrivilegedAdmin();

  const name = requiredString(formData, "name");
  const email = requiredEmail(formData, "email");
  const role = requiredRole(formData, "role");
  const password = requiredString(formData, "password");

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("A user with that email already exists");
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      name,
      email,
      role,
      passwordHash,
      active: true,
    },
  });

  revalidatePath("/admin/users");
}

export async function updateAdminUser(formData: FormData) {
  await requirePrivilegedAdmin();

  const userId = requiredString(formData, "userId");
  const name = requiredString(formData, "name");
  const email = requiredEmail(formData, "email");
  const role = requiredRole(formData, "role");
  const password = String(formData.get("password") ?? "").trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== userId) {
    throw new Error("A user with that email already exists");
  }

  const data: {
    name: string;
    email: string;
    role: AdminRole;
    passwordHash?: string;
  } = {
    name,
    email,
    role,
  };

  if (password) {
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
    data.passwordHash = await hashPassword(password);
  }

  await prisma.user.update({
    where: { id: userId },
    data,
  });

  revalidatePath("/admin/users");
}

export async function deleteAdminUser(formData: FormData) {
  const session = await requirePrivilegedAdmin();

  const userId = requiredString(formData, "userId");

  if (session.id === userId) {
    throw new Error("You cannot delete your own account");
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}

export async function updatePaymentMethodQr(formData: FormData) {
  await requirePrivilegedAdmin();

  const paymentMethodId = requiredString(formData, "paymentMethodId");
  const file = formData.get("qr") as File | null;

  if (!file || file.size === 0) {
    throw new Error("QR image is required");
  }

  const qrUrl = await saveLocalUpload("payment-qr", file);
  await prisma.paymentMethod.update({
    where: { id: paymentMethodId },
    data: { qrUrl },
  });
  revalidatePath("/admin/payment-methods");
  revalidatePath("/vendor/orders/new");
}

export async function toggleContractStatus(formData: FormData) {
  await requirePrivilegedAdmin();

  const contractId = requiredString(formData, "contractId");
  const active = requiredString(formData, "active") === "true";

  await prisma.contract.update({ where: { id: contractId }, data: { active } });
  revalidatePath("/admin/contracts");
}

export async function addContract(formData: FormData) {
  await requirePrivilegedAdmin();

  const version = requiredString(formData, "version");
  const active = String(formData.get("active") ?? "") === "on";
  const file = formData.get("contract") as File | null;

  if (!file || file.size === 0) {
    throw new Error("Contract file is required");
  }

  const fileUrl = await saveLocalUpload("contracts", file);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await prisma.$transaction(async (tx: any) => {
    if (active) {
      await tx.contract.updateMany({ data: { active: false } });
    }

    await tx.contract.create({ data: { version, fileUrl, active } });
  });

  revalidatePath("/admin/contracts");
}

export async function updateKycStatus(formData: FormData) {
  await requirePrivilegedAdmin();

  const vendorId = requiredString(formData, "vendorId");
  const status = requiredString(formData, "status");
  const note = String(formData.get("note") ?? "").trim() || null;

  if (status !== "APPROVED" && status !== "REJECTED" && status !== "REVIEW") {
    throw new Error("Unsupported KYC status");
  }

  await prisma.$transaction([
    prisma.vendor.update({
      where: { id: vendorId },
      data: {
        kycStatus: status,
        status:
          status === "APPROVED"
            ? "APPROVED"
            : status === "REJECTED"
              ? "REJECTED"
              : "PENDING",
        rejectionReason: status === "REJECTED" ? note : null,
      },
    }),
    prisma.kYCDocument.updateMany({
      where: { vendorId },
      data: { status, note },
    }),
  ]);

  revalidatePath(`/admin/kyc/${vendorId}`);
  revalidatePath(`/admin/vendors/${vendorId}`);
  revalidatePath("/admin/kyc");
  revalidatePath("/admin/vendors");
}

export async function processSimStatus(formData: FormData) {
  const session = await requirePrivilegedAdmin();
  const simId = String(formData.get("simId") ?? "").trim();
  const targetStatus = requiredString(formData, "status");
  const note = String(formData.get("note") ?? "").trim() || null;

  if (targetStatus !== "APPROVED" && targetStatus !== "REJECTED") {
    throw new Error("SIM can only be approved or rejected from this screen");
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await prisma.$transaction(async (tx: any) => {
    const sim = await tx.sim.findUnique({
      where: simId
        ? { id: simId }
        : { number: requiredString(formData, "number") },
      include: { assignedVendor: true, operator: true },
    });

    if (!sim || !sim.assignedVendorId || !sim.assignedVendor) {
      throw new Error("Assigned SIM not found");
    }

    if (sim.status === "APPROVED") {
      return;
    }

    const commission =
      sim.assignedVendor.commissionOverride ?? sim.operator.defaultCommission;
    const fine = sim.assignedVendor.fineOverride ?? sim.operator.defaultFine;

    if (targetStatus === "REJECTED") {
      if (sim.status === "REJECTED") return;

      const vendor = await tx.vendor.update({
        where: { id: sim.assignedVendorId },
        data: { balance: { decrement: fine } },
      });

      await tx.sim.update({
        where: { id: sim.id },
        data: {
          status: "REJECTED",
          fineApplied: fine,
          commissionApplied: null,
        },
      });

      await tx.balanceLedger.create({
        data: {
          vendorId: sim.assignedVendorId,
          type: "SIM_REJECTED",
          amount: -fine,
          runningBalance: vendor.balance,
          note: note ?? "Operator rejection fine",
          simId: sim.id,
          orderId: sim.orderId,
          adminUserId: session.id,
        },
      });

      await tx.simStatusEvent.create({
        data: {
          simId: sim.id,
          fromStatus: sim.status,
          toStatus: "REJECTED",
          adminUserId: session.id,
          note,
        },
      });

      return;
    }

    let runningBalance = sim.assignedVendor.balance;

    if (sim.status === "REJECTED" && sim.fineApplied) {
      const vendor = await tx.vendor.update({
        where: { id: sim.assignedVendorId },
        data: { balance: { increment: sim.fineApplied } },
      });
      runningBalance = vendor.balance;

      await tx.balanceLedger.create({
        data: {
          vendorId: sim.assignedVendorId,
          type: "MANUAL_ADJUSTMENT",
          amount: sim.fineApplied,
          runningBalance,
          note: `Fine reversed before approval for SIM ${sim.number}`,
          simId: sim.id,
          orderId: sim.orderId,
          adminUserId: session.id,
        },
      });
    }

    const vendor = await tx.vendor.update({
      where: { id: sim.assignedVendorId },
      data: { balance: { increment: commission } },
    });
    runningBalance = vendor.balance;

    await tx.sim.update({
      where: { id: sim.id },
      data: {
        status: "APPROVED",
        commissionApplied: commission,
        fineApplied: null,
      },
    });

    await tx.balanceLedger.create({
      data: {
        vendorId: sim.assignedVendorId,
        type: "SIM_APPROVED",
        amount: commission,
        runningBalance,
        note: note ?? "Commission credited after operator approval",
        simId: sim.id,
        orderId: sim.orderId,
        adminUserId: session.id,
      },
    });

    await tx.simStatusEvent.create({
      data: {
        simId: sim.id,
        fromStatus: sim.status,
        toStatus: "APPROVED",
        adminUserId: session.id,
        note,
      },
    });
  });

  revalidatePath("/admin/approval");
  revalidatePath("/admin/sims");
  revalidatePath("/admin/vendors");
}

export async function processSimSearch(formData: FormData) {
  const session = await getCurrentSession();
  if (!session || session.kind !== "admin") {
    throw new Error("Unauthorized");
  }

  const number = String(formData.get("number") ?? "").trim();
  redirect(
    number
      ? `/admin/approval?q=${encodeURIComponent(number)}`
      : "/admin/approval",
  );
}

export async function assignSimsToOrder(formData: FormData) {
  const session = await requirePrivilegedAdmin();

  const orderId = requiredString(formData, "orderId");
  const simIds = String(formData.get("simIds") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!simIds.length) {
    throw new Error("At least one SIM must be selected");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { sims: true, vendor: true, operator: true },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const totalAssignedCount = order.sims.length + simIds.length;
  if (totalAssignedCount > order.quantity) {
    throw new Error(
      `Cannot assign more than ${order.quantity} SIMs to this order`,
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await prisma.$transaction(async (tx: any) => {
    const simsToAssign = await tx.sim.findMany({
      where: {
        id: { in: simIds },
        operatorId: order.operatorId,
        status: "ACTIVE",
        orderId: null,
        assignedVendorId: null,
      },
    });

    if (simsToAssign.length !== simIds.length) {
      throw new Error(
        "Some SIMs are not available or belong to a different operator",
      );
    }

    await tx.sim.updateMany({
      where: { id: { in: simIds } },
      data: {
        orderId: order.id,
        assignedVendorId: order.vendorId,
        status: "ASSIGNED",
      },
    });

    await tx.orderStatusEvent.create({
      data: {
        orderId: order.id,
        fromStatus: order.status,
        toStatus: order.status,
        adminUserId: session.id,
        note: `${simIds.length} SIM(s) assigned to vendor`,
      },
    });
  });

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
}
