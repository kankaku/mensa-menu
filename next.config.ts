import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Enable experimental features for better performance
  experimental: {
    // Optimize package imports
  },
};

export default nextConfig;
