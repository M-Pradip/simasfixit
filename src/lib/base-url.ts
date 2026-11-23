export function publicUrl(req: Request, path: string) {
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  return new URL(path, `${proto}://${host}`);
}
