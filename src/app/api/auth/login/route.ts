import { encryptSession, sessionCookieName } from "@/lib/auth";
import { publicUrl } from "@/lib/base-url";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";
function normalizePhone(value: string) {
  return value.replace(/[\s()-]/g, "");
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const identifier = String(
    formData.get("identifier") ??
      formData.get("email") ??
      formData.get("phone") ??
      "",
  )
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!identifier || !password) {
    return NextResponse.redirect(
      publicUrl(request, "/login?error=invalid"),
      303,
    );
  }

  if (isEmail(identifier)) {
    const user = await prisma.user.findUnique({ where: { email: identifier } });

    if (
      !user ||
      !user.active ||
      !(await bcrypt.compare(password, user.passwordHash))
    ) {
      return NextResponse.redirect(
        publicUrl(request, "/login?error=invalid"),
        303,
      );
    }

    const token = await encryptSession({
      id: user.id,
      name: user.name,
      kind: "admin",
      role: user.role,
    });
    const response = NextResponse.redirect(publicUrl(request, "/admin"), 303);

    response.cookies.set(sessionCookieName, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  }

  const phone = normalizePhone(identifier);
  const vendor = await prisma.vendor.findUnique({ where: { phone } });

  if (!vendor) {
    return NextResponse.redirect(
      publicUrl(request, "/login?error=invalid"),
      303,
    );
  }

  if (vendor.status !== "APPROVED") {
    return NextResponse.redirect(
      publicUrl(request, "/login?error=pending"),
      303,
    );
  }

  if (!(await bcrypt.compare(password, vendor.passwordHash))) {
    return NextResponse.redirect(
      publicUrl(request, "/login?error=vendor_password"),
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
