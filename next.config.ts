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
  webpack: (config) => {
    config.externals.push("ssh2");
    // ssh2;
    // config.module.rules.push({
    //   test: /sshcrypto\.node$/,
    //   use: "ignore-loader",
    // });
    return config;
  },
};

export default nextConfig;
