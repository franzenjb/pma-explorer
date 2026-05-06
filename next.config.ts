import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.portlandmuseum.org",
        pathname: "/wp-content/**",
      },
      {
        protocol: "https",
        hostname: "portlandmuseum.org",
        pathname: "/wp-content/**",
      },
      {
        protocol: "https",
        hostname: "collections.portlandmuseum.org",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
