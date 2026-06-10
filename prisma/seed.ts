// NEW
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured.");
}

const prisma = new PrismaClient();

function simNumbers(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, index) =>
    String(start + index),
  );
}

async function main() {
  await prisma.balanceLedger.deleteMany();
  await prisma.simStatusEvent.deleteMany();
  await prisma.orderStatusEvent.deleteMany();
  await prisma.sim.deleteMany();
  await prisma.order.deleteMany();
  await prisma.kYCDocument.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.user.deleteMany();
  await prisma.operator.deleteMany();

  const passwordHash = await bcrypt.hash("Admin@12345", 10);
  const vendorPasswordHash = await bcrypt.hash("Vendor@12345", 10);

  const [superadmin, manager] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Pradip ASFixit",
        email: "admin@asfixit.com",
        passwordHash,
        role: "SUPERADMIN",
      },
    }),
    prisma.user.create({
      data: {
        name: "Operations Manager",
        email: "manager@asfixit.com",
        passwordHash,
        role: "MANAGER",
      },
    }),
  ]);

  await prisma.user.create({
    data: {
      name: "Support Desk",
      email: "support@asfixit.com",
      passwordHash,
      role: "SUPPORT",
    },
  });

  const ncell = await prisma.operator.create({
    data: {
      name: "Ncell",
      defaultCommission: 120,
      defaultFine: 60,
      status: "ACTIVE",
    },
  });

  await prisma.operator.create({
    data: {
      name: "Nepal Telecom",
      defaultCommission: 100,
      defaultFine: 50,
      status: "INACTIVE",
    },
  });

  const activeContract = await prisma.contract.create({
    data: {
      version: "v2026.06",
      fileUrl: "/uploads/contracts/asfixit-v2026-06.pdf",
      active: true,
    },
  });

  await prisma.contract.create({
    data: {
      version: "v2026.05",
      fileUrl: "/uploads/contracts/asfixit-v2026-05.pdf",
      active: false,
    },
  });

  await prisma.paymentMethod.createMany({
    data: [
      {
        name: "Cash on Delivery",
        type: "COD",
        active: true,
        note: "Physical settlement on delivery",
      },
      {
        name: "Online Payment",
        type: "ONLINE",
        active: true,
        note: "Digital payment with optional commission offset",
      },
    ],
  });

  const laxmi = await prisma.vendor.create({
    data: {
      ownerName: "Sanjay Shrestha",
      businessName: "Laxmi Mobile Pasal",
      address: "New Road, Kathmandu",
      phone: "9800000001",
      email: "laxmi@example.com",
      citizenshipNumber: "26-01-77-12345",
      panNumber: "609876543",
      passwordHash: vendorPasswordHash,
      status: "APPROVED",
      kycStatus: "APPROVED",
      commissionOverride: 130,
      fineOverride: 55,
      notes:
        "High volume Pasal. Allows commission withdrawals for online orders.",
      balance: 8460,
      signedContractId: activeContract.id,
    },
  });

  const bhaktapur = await prisma.vendor.create({
    data: {
      ownerName: "Rita Tamang",
      businessName: "Bhaktapur Phone Center",
      address: "Suryabinayak, Bhaktapur",
      phone: "9800000002",
      email: "bhaktapur@example.com",
      citizenshipNumber: "27-02-88-33221",
      panNumber: "609111222",
      passwordHash: vendorPasswordHash,
      status: "PENDING",
      kycStatus: "REVIEW",
      notes: "Signed contract scan needs review.",
      balance: 0,
      signedContractId: activeContract.id,
    },
  });

  const koshi = await prisma.vendor.create({
    data: {
      ownerName: "Amit Rai",
      businessName: "Koshi Digital Store",
      address: "Itahari, Sunsari",
      phone: "9800000003",
      email: "koshi@example.com",
      citizenshipNumber: "05-44-22-98765",
      panNumber: "607778889",
      passwordHash: vendorPasswordHash,
      status: "APPROVED",
      kycStatus: "APPROVED",
      rejectionReason: null,
      notes: "Order blocked until negative balance is cleared.",
      balance: -1240,
      signedContractId: activeContract.id,
    },
  });

  for (const vendor of [laxmi, bhaktapur, koshi]) {
    await prisma.kYCDocument.createMany({
      data: [
        {
          vendorId: vendor.id,
          type: "CITIZENSHIP",
          fileUrl: `/uploads/kyc/${vendor.id}/citizenship.pdf`,
          status: vendor.kycStatus,
        },
        {
          vendorId: vendor.id,
          type: "PAN",
          fileUrl: `/uploads/kyc/${vendor.id}/pan.pdf`,
          status: vendor.kycStatus,
        },
        {
          vendorId: vendor.id,
          type: "ADDRESS_PROOF",
          fileUrl: `/uploads/kyc/${vendor.id}/address.pdf`,
          status: vendor.kycStatus,
        },
        {
          vendorId: vendor.id,
          type: "SIGNED_CONTRACT",
          fileUrl: `/uploads/kyc/${vendor.id}/contract.pdf`,
          status: vendor.kycStatus,
        },
      ],
    });
  }

  await prisma.sim.createMany({
    data: simNumbers(9812345600, 9812345999).map((number) => ({
      number,
      operatorId: ncell.id,
    })),
  });

  const order1046 = await prisma.order.create({
    data: {
      reference: "ORD-1046",
      vendorId: laxmi.id,
      operatorId: ncell.id,
      quantity: 100,
      assignedStartNumber: "9812345600",
      assignedEndNumber: "9812345699",
      paymentMethod: "COD",
      status: "DISPATCHED",
      assignedAt: new Date("2026-06-07T09:10:00+05:45"),
      dispatchedAt: new Date("2026-06-08T10:00:00+05:45"),
    },
  });

  const order1047 = await prisma.order.create({
    data: {
      reference: "ORD-1047",
      vendorId: koshi.id,
      operatorId: ncell.id,
      quantity: 30,
      assignedStartNumber: "9812345700",
      assignedEndNumber: "9812345729",
      paymentMethod: "COD",
      status: "DELIVERED",
      assignedAt: new Date("2026-06-07T11:20:00+05:45"),
      dispatchedAt: new Date("2026-06-07T15:00:00+05:45"),
      deliveredAt: new Date("2026-06-08T14:00:00+05:45"),
    },
  });

  const order1048 = await prisma.order.create({
    data: {
      reference: "ORD-1048",
      vendorId: laxmi.id,
      operatorId: ncell.id,
      quantity: 50,
      assignedStartNumber: "9812345800",
      assignedEndNumber: "9812345849",
      paymentMethod: "ONLINE",
      commissionUsed: 1500,
      status: "ASSIGNED",
      assignedAt: new Date("2026-06-09T09:30:00+05:45"),
    },
  });

  await prisma.sim.updateMany({
    where: { number: { gte: "9812345600", lte: "9812345699" } },
    data: {
      status: "ASSIGNED",
      assignedVendorId: laxmi.id,
      orderId: order1046.id,
    },
  });
  await prisma.sim.updateMany({
    where: { number: { gte: "9812345700", lte: "9812345729" } },
    data: {
      status: "ASSIGNED",
      assignedVendorId: koshi.id,
      orderId: order1047.id,
    },
  });
  await prisma.sim.updateMany({
    where: { number: { gte: "9812345800", lte: "9812345849" } },
    data: {
      status: "ASSIGNED",
      assignedVendorId: laxmi.id,
      orderId: order1048.id,
    },
  });

  const approvedSim = await prisma.sim.update({
    where: { number: "9812345600" },
    data: {
      status: "APPROVED",
      assignedVendorId: laxmi.id,
      orderId: order1046.id,
      commissionApplied: 130,
    },
  });

  const rejectedSim = await prisma.sim.update({
    where: { number: "9812345700" },
    data: {
      status: "REJECTED",
      assignedVendorId: koshi.id,
      orderId: order1047.id,
      fineApplied: 60,
    },
  });

  await prisma.balanceLedger.createMany({
    data: [
      {
        vendorId: laxmi.id,
        type: "MANUAL_ADJUSTMENT",
        amount: 2000,
        runningBalance: 9900,
        note: "Fine settlement received by bank transfer",
        adminUserId: manager.id,
      },
      {
        vendorId: laxmi.id,
        type: "COMMISSION_WITHDRAWAL",
        amount: -1500,
        runningBalance: 8400,
        note: "Commission withdrawal for online order",
        orderId: order1048.id,
        adminUserId: superadmin.id,
      },
      {
        vendorId: laxmi.id,
        type: "SIM_REJECTED",
        amount: -55,
        runningBalance: 8340,
        note: "Operator rejection fine",
        adminUserId: manager.id,
      },
      {
        vendorId: laxmi.id,
        type: "SIM_APPROVED",
        amount: 130,
        runningBalance: 8460,
        note: "Commission credited after operator approval",
        simId: approvedSim.id,
        orderId: order1046.id,
        adminUserId: manager.id,
      },
      {
        vendorId: koshi.id,
        type: "SIM_REJECTED",
        amount: -60,
        runningBalance: -1240,
        note: "Operator rejection fine; order access blocked",
        simId: rejectedSim.id,
        orderId: order1047.id,
        adminUserId: manager.id,
      },
    ],
  });

  await prisma.orderStatusEvent.createMany({
    data: [
      {
        orderId: order1046.id,
        toStatus: "ASSIGNED",
        adminUserId: manager.id,
        note: "Assigned range 9812345600-9812345699",
      },
      {
        orderId: order1046.id,
        fromStatus: "ASSIGNED",
        toStatus: "DISPATCHED",
        adminUserId: manager.id,
      },
      {
        orderId: order1047.id,
        toStatus: "ASSIGNED",
        adminUserId: manager.id,
        note: "Assigned range 9812345700-9812345729",
      },
      {
        orderId: order1047.id,
        fromStatus: "DISPATCHED",
        toStatus: "DELIVERED",
        adminUserId: manager.id,
      },
      {
        orderId: order1048.id,
        toStatus: "ASSIGNED",
        adminUserId: superadmin.id,
        note: "Online payment with commission offset",
      },
    ],
  });

  await prisma.simStatusEvent.createMany({
    data: [
      {
        simId: approvedSim.id,
        fromStatus: "ASSIGNED",
        toStatus: "APPROVED",
        adminUserId: manager.id,
        note: "Activation report approved",
      },
      {
        simId: rejectedSim.id,
        fromStatus: "ASSIGNED",
        toStatus: "REJECTED",
        adminUserId: manager.id,
        note: "Activation report rejected",
      },
    ],
  });

  console.log("Seeded ASFixit demo data.");
  console.log("Admin login: admin@asfixit.com / Admin@12345");
  console.log("Vendor login: 9800000001 / Vendor@12345");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
