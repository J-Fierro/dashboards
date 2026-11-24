import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Never send the dashboard URL (which may still carry ?key=) to other sites.
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "Referrer-Policy", value: "no-referrer" }, { key: "X-Robots-Tag", value: "noindex" }] }];
  },
  images: {
    // Meta creative thumbnails are served from Facebook's CDN.
    remotePatterns: [
      { protocol: "https", hostname: "**.fbcdn.net" },
      { protocol: "https", hostname: "**.facebook.com" },
    ],
  },
};

export default nextConfig;
