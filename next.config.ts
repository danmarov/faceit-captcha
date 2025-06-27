import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["c04e-62-122-67-12.ngrok-free.app"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
