import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Meta creative thumbnails are served from Facebook's CDN.
    remotePatterns: [
      { protocol: "https", hostname: "**.fbcdn.net" },
      { protocol: "https", hostname: "**.facebook.com" },
    ],
  },
};

export default nextConfig;
