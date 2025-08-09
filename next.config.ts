import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Disable ESLint during build for production
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Allow cross-origin requests for development
  allowedDevOrigins: [
    "192.168.1.85",
    "192.168.1.85:3000",
    "192.168.1.85:3001",
    "localhost:3000",
    "127.0.0.1:3000"
  ],
};

export default nextConfig;
