import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three", "@edunex/design-system"],
  experimental: {
    optimizePackageImports: ["@edunex/design-system"],
  },
};

export default nextConfig;
