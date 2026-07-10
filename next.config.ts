import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  // CMS-uploaded media is served by the backend's local storage provider
  // (backend/src/storage/LocalStorageProvider.ts) at http://localhost:4000/uploads/**.
  // next/image's optimizer refuses to fetch any remote URL that resolves to
  // a loopback/private IP (a hardcoded SSRF guard — this can't be worked
  // around via `images.remotePatterns`). Proxying the path through Next's
  // own server makes it same-origin instead, which sidesteps that check
  // entirely. `src/lib/api/dto.ts` strips the backend origin from uploaded
  // URLs so components request the relative path below rather than the
  // absolute `http://localhost:4000/...` one.
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "http://localhost:4000/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
