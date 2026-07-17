import { encryptSession, sessionCookieName } from "@/lib/auth";
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
      new URL("/vendor/login?error=invalid", request.url),
      303,
    );
  }

  if (vendor.status !== "APPROVED") {
    return NextResponse.redirect(
      new URL("/vendor/login?error=pending", request.url),
      303,
    );
  }

  if (!(await bcrypt.compare(password, vendor.passwordHash))) {
    return NextResponse.redirect(
      new URL("/vendor/login?error=invalid", request.url),
      303,
    );
  }

  const token = await encryptSession({
    id: vendor.id,
    name: vendor.businessName,
    kind: "vendor",
  });
  const response = NextResponse.redirect(new URL("/vendor", request.url), 303);

  response.cookies.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
