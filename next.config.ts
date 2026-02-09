import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    // Prevent Next.js from inferring an incorrect workspace root when
    // multiple lockfiles exist outside this app directory.
    root: process.cwd(),
  },
};

export default nextConfig;
