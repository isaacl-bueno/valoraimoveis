import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // Facilita deploy em VPS Hostinger (Node + PM2)
  output: "standalone",
  images: {
    localPatterns: [
      {
        pathname: "/api/media/**",
      },
      {
        pathname: "/uploads/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/uxpilot-auth.appspot.com/**",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
