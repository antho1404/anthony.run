import type { NextConfig } from "next";
import path from "path";

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
  webpack: (config, { isServer }) => {
    if (isServer) config.resolve.alias["ssh2"] = path.resolve("./ssh2.noop.js");

    return config;
  },
};

export default nextConfig;
