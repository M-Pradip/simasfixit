import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  experimental: {
    serverActions: { bodySizeLimit: "60mb" },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
