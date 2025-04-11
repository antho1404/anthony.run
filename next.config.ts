import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    typedEnv: true,
  },
  images: {
    remotePatterns: [
      { hostname: "avatars.githubusercontent.com", pathname: "/u/*" },
    ],
  },
};

export default nextConfig;
