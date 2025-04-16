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
    config.externals = config.externals || [];
    config.externals.push("ssh2");

    if (isServer)
      config.resolve.alias["docker-modem/lib/ssh.js"] = path.resolve(
        __dirname,
        "ssh2.noop.js"
      );

    return config;
  },
};

export default nextConfig;
