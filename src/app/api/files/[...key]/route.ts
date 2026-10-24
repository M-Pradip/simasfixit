import { getCurrentSession } from "@/lib/auth";
import { readStoredUpload } from "@/lib/upload";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key: parts } = await params;
  const key = parts.join("/");
  if (!/^(contracts|kyc|payment-qr|payment-proof)\/[a-zA-Z0-9-]+\.[a-zA-Z0-9]+$/.test(key)) {
    return new NextResponse("Not found", { status: 404 });
  }
  if (key.startsWith("kyc/") || key.startsWith("payment-proof/")) {
    const session = await getCurrentSession();
    if (session?.kind !== "admin") return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const stored = await readStoredUpload(key);
    const body = await stored.Body?.transformToWebStream();
    if (!body) return new NextResponse("File not found", { status: 404 });
    return new NextResponse(body, {
      headers: {
        "Content-Type": stored.ContentType ?? "application/octet-stream",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("File not found", { status: 404 });
  }
}
