import { publicUrl } from "@/lib/base-url";
import { NextResponse, type NextRequest } from "next/server";
import { decryptSession, sessionCookieName } from "./lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieValue = request.cookies.get(sessionCookieName)?.value;

  const session = await decryptSession(cookieValue);

  if (pathname.startsWith("/admin/login")) {
    if (session?.kind === "admin") {
      return NextResponse.redirect(publicUrl(request, "/admin"));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/vendor/login")) {
    if (session?.kind === "vendor") {
      return NextResponse.redirect(publicUrl(request, "/vendor"));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/vendor/register")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (session?.kind !== "admin") {
      return NextResponse.redirect(publicUrl(request, "/admin/login"));
    }
  }

  if (pathname.startsWith("/vendor")) {
    if (session?.kind !== "vendor") {
      return NextResponse.redirect(publicUrl(request, "/vendor/login"));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/vendor/:path*"],
};
