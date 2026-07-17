import { prisma } from "@/lib/prisma";
import { saveLocalUpload } from "@/lib/upload";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

function normalizePhone(value: string) {
  return value.replace(/[\s()-]/g, "");
}

function redirectWithError(request: NextRequest, code: string) {
  return NextResponse.redirect(
    new URL(`/vendor/register?error=${encodeURIComponent(code)}`, request.url),
    303,
  );
}

function requiredText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const ownerName = requiredText(formData, "ownerName");
  const businessName = requiredText(formData, "businessName");
  const address = requiredText(formData, "address");
  const phone = normalizePhone(requiredText(formData, "phone"));
  const emailRaw = requiredText(formData, "email");
  const email = emailRaw ? emailRaw.toLowerCase() : null;
  const citizenshipNumber = requiredText(formData, "citizenshipNumber");
  const panNumber = requiredText(formData, "panNumber");
  const password = requiredText(formData, "password");
  const confirmPassword = requiredText(formData, "confirmPassword");

  if (!ownerName || !businessName || !address || !phone || !citizenshipNumber || !panNumber) {
    return redirectWithError(request, "invalid_upload");
  }

  if (!/^\+?[0-9]{7,15}$/.test(phone)) {
    return redirectWithError(request, "invalid_phone");
  }

  if (!emailRaw) {
    // Email is optional, so leave it empty.
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)
  ) {
    return redirectWithError(request, "invalid_email");
  }

  if (password !== confirmPassword) {
    return redirectWithError(request, "password_mismatch");
  }

  if (password.length < 8) {
    return redirectWithError(request, "weak_password");
  }

  const activeContract = await prisma.contract.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  if (!activeContract) {
    return redirectWithError(request, "missing_contract");
  }

  const passportPhoto = formData.get("passportPhoto");
  const citizenshipFront = formData.get("citizenshipFront");
  const citizenshipBack = formData.get("citizenshipBack");
  const panVat = formData.get("panVat");
  const signedContract = formData.get("signedContract");

  if (
    !(passportPhoto instanceof File) ||
    !(citizenshipFront instanceof File) ||
    !(citizenshipBack instanceof File) ||
    !(panVat instanceof File) ||
    !(signedContract instanceof File)
  ) {
    return redirectWithError(request, "missing_file");
  }

  if (
    !passportPhoto.size ||
    !citizenshipFront.size ||
    !citizenshipBack.size ||
    !panVat.size ||
    !signedContract.size
  ) {
    return redirectWithError(request, "missing_file");
  }

  const existing = await prisma.vendor.findFirst({
    where: {
      OR: [
        { phone },
        email ? { email } : undefined,
        { citizenshipNumber },
        { panNumber },
      ].filter(Boolean) as Array<Record<string, string>>,
    },
    select: { id: true },
  });

  if (existing) {
    return redirectWithError(request, "duplicate_account");
  }

  const [passportPhotoUrl, citizenshipFrontUrl, citizenshipBackUrl, panVatUrl, signedContractUrl] =
    await Promise.all([
      saveLocalUpload("kyc", passportPhoto),
      saveLocalUpload("kyc", citizenshipFront),
      saveLocalUpload("kyc", citizenshipBack),
      saveLocalUpload("kyc", panVat),
      saveLocalUpload("contracts", signedContract),
    ]);

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await prisma.$transaction(async (tx) => {
      const createdVendor = await tx.vendor.create({
        data: {
          ownerName,
          businessName,
          address,
          phone,
          email,
          citizenshipNumber,
          panNumber,
          passwordHash,
          status: "PENDING",
          kycStatus: "PENDING",
          signedContractId: activeContract.id,
        },
      });

      await tx.kYCDocument.createMany({
        data: [
          {
            vendorId: createdVendor.id,
            type: "ADDRESS_PROOF",
            fileUrl: passportPhotoUrl,
            status: "PENDING",
            note: "Passport size photo",
          },
          {
            vendorId: createdVendor.id,
            type: "CITIZENSHIP",
            fileUrl: citizenshipFrontUrl,
            status: "PENDING",
            note: "Citizenship front",
          },
          {
            vendorId: createdVendor.id,
            type: "CITIZENSHIP",
            fileUrl: citizenshipBackUrl,
            status: "PENDING",
            note: "Citizenship back",
          },
          {
            vendorId: createdVendor.id,
            type: "PAN",
            fileUrl: panVatUrl,
            status: "PENDING",
            note: "Business PAN / VAT",
          },
          {
            vendorId: createdVendor.id,
            type: "SIGNED_CONTRACT",
            fileUrl: signedContractUrl,
            status: "PENDING",
            note: `Signed contract for ${activeContract.version}`,
          },
        ],
      });

      return createdVendor;
    });

    return NextResponse.redirect(
      new URL("/vendor/login?registered=1", request.url),
      303,
    );
  } catch {
    return redirectWithError(request, "registration_failed");
  }
}
