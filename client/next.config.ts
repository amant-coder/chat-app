import type { NextConfig } from "next";

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
  experimental: {
    // @ts-expect-error - Next.js types might not include turbopack in ExperimentalConfig yet
    turbopack: {
      root: "..",
    },
  },
};

export default nextConfig;
