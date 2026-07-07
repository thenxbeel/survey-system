import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dev-server access from local network IPs (e.g. testing from another
  // machine on the LAN). Next.js 16 blocks cross-origin dev resources by
  // default for safety. Production builds are unaffected.
  //
  // The list below covers the most common dev access patterns. The actual
  // origin used for URL generation is centralized in lib/app-url.ts via
  // NEXT_PUBLIC_APP_URL (set in .env) with auto-detected LAN IP as fallback.
  allowedDevOrigins: [
    "localhost:3000",
    "127.0.0.1:3000",
    "172.30.1.136",
    "172.30.1.136:3000",
    "21.0.14.67",
    "21.0.14.67:3000",
    "172.20.10.2",
    "172.20.10.2:3000",
  ],
};

export default nextConfig;
