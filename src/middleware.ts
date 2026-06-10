import { NextResponse, type NextRequest } from "next/server";
import { decryptSession, sessionCookieName } from "./lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await decryptSession(request.cookies.get(sessionCookieName)?.value);

  if (pathname.startsWith("/admin/login")) {
    if (session?.kind === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/vendor/login")) {
    if (session?.kind === "vendor") {
      return NextResponse.redirect(new URL("/vendor", request.url));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (session?.kind !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (pathname.startsWith("/vendor")) {
    if (session?.kind !== "vendor") {
      return NextResponse.redirect(new URL("/vendor/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/vendor/:path*"],
};
