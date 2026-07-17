import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type LocalUploadKind = "contracts" | "kyc" | "payment-qr";

export function localUploadPath(kind: LocalUploadKind, fileName: string) {
  return `/uploads/${kind}/${fileName}`;
}

function safeUploadName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
}

export async function saveLocalUpload(kind: LocalUploadKind, file: File) {
  if (!file.size) {
    throw new Error("A file is required");
  }

  const fileName = `${Date.now()}-${safeUploadName(file.name)}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", kind);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(
    path.join(uploadDir, fileName),
    Buffer.from(await file.arrayBuffer()),
  );

  return localUploadPath(kind, fileName);
}
