import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  // Turbopack monorepo root config - using absolute path to solve resolution issues
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
};

export default nextConfig;
