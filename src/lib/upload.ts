import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";

export type UploadKind = "contracts" | "kyc" | "payment-qr" | "payment-proof";

export const MAX_UPLOAD_BYTES: Record<UploadKind, number> = {
  contracts: 20 * 1024 * 1024,
  kyc: 10 * 1024 * 1024,
  "payment-qr": 5 * 1024 * 1024,
  "payment-proof": 5 * 1024 * 1024,
};

const MIME_TYPES: Record<UploadKind, Set<string>> = {
  contracts: new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]),
  kyc: new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]),
  "payment-qr": new Set(["image/jpeg", "image/png", "image/webp"]),
  "payment-proof": new Set(["image/jpeg", "image/png", "image/webp"]),
};

function storage() {
  const endpointValue = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!endpointValue || !accessKeyId || !secretAccessKey) {
    throw new Error("R2_ENDPOINT, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY must be configured.");
  }

  const endpoint = new URL(endpointValue);
  const bucket = process.env.R2_BUCKET || endpoint.pathname.split("/").filter(Boolean).at(-1);
  if (!bucket) throw new Error("R2_BUCKET must be configured or included in R2_ENDPOINT.");

  return {
    bucket,
    client: new S3Client({
      region: process.env.R2_REGION || "auto",
      endpoint: endpoint.origin,
      forcePathStyle: true,
      credentials: { accessKeyId, secretAccessKey },
    }),
  };
}

export function validateUpload(kind: UploadKind, file: File) {
  if (!file.size) throw new Error("A file is required.");
  if (file.size > MAX_UPLOAD_BYTES[kind]) {
    throw new Error(`File is too large. Maximum size is ${Math.floor(MAX_UPLOAD_BYTES[kind] / 1024 / 1024)} MB.`);
  }
  if (!MIME_TYPES[kind].has(file.type)) throw new Error("This file type is not allowed.");
}

export async function saveUpload(kind: UploadKind, file: File) {
  validateUpload(kind, file);
  const { bucket, client } = storage();
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const key = `${kind}/${randomUUID()}.${extension}`;
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
  }));
  return `/api/files/${key}`;
}

export async function readStoredUpload(key: string) {
  const { bucket, client } = storage();
  return client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
}
