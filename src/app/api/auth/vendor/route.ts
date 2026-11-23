import { encryptSession, sessionCookieName } from "@/lib/auth";
import { publicUrl } from "@/lib/base-url";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";
function normalizePhone(value: string) {
  return value.replace(/[\s()-]/g, "");
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const phone = normalizePhone(
    String(formData.get("phone") ?? formData.get("identifier") ?? "").trim(),
  );
  const password = String(formData.get("password") ?? "");
  const vendor = await prisma.vendor.findUnique({ where: { phone } });

  if (!vendor) {
    return NextResponse.redirect(
      publicUrl(request, "/vendor/login?error=invalid"),
      303,
    );
  }

  if (vendor.status !== "APPROVED") {
    return NextResponse.redirect(
      publicUrl(request, "/vendor/login?error=pending"),
      303,
    );
  }

  if (!(await bcrypt.compare(password, vendor.passwordHash))) {
    return NextResponse.redirect(
      publicUrl(request, "/vendor/login?error=vendor_password"),
      303,
    );
  }

  const token = await encryptSession({
    id: vendor.id,
    name: vendor.businessName,
    kind: "vendor",
  });
  const response = NextResponse.redirect(publicUrl(request, "/vendor"), 303);

  response.cookies.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
