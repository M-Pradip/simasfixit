import { encryptSession, sessionCookieName } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const vendor = await prisma.vendor.findUnique({ where: { phone } });

  if (
    !vendor ||
    vendor.status !== "APPROVED" ||
    !(await bcrypt.compare(password, vendor.passwordHash))
  ) {
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
    sameSite: "strict",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
