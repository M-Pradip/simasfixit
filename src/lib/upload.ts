export function localUploadPath(kind: "contracts" | "kyc" | "payment-qr", fileName: string) {
  return `/uploads/${kind}/${fileName}`;
}
