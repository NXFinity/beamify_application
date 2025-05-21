import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'iibustore.lon1.digitaloceanspaces.com',
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
