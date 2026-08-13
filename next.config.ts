import type { NextConfig } from "next";

/*
 * Backend origin, derived from the same env var the API clients read so dev
 * and production can never drift apart. NEXT_PUBLIC_API_URL points at the API
 * root (".../api"); stripping that suffix yields the asset origin. This
 * mirrors `API_ORIGIN` in src/lib/api/dto.ts.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const BACKEND_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    // Allow Unsplash and the backend origin (so next/image can optimise
    // images served from Railway). The backend origin is derived from
    // `NEXT_PUBLIC_API_URL` so it matches the same host the API client uses.
    remotePatterns: (() => {
      try {
        const backendUrl = new URL(BACKEND_ORIGIN);
        const backendProtocol = backendUrl.protocol.replace(":", "") as "http" | "https";
        return [
          { protocol: "https", hostname: "images.unsplash.com" },
          { protocol: backendProtocol, hostname: backendUrl.hostname },
        ];
      } catch (e) {
        return [{ protocol: "https", hostname: "images.unsplash.com" }];
      }
    })(),
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920, 2560],
    imageSizes: [64, 96, 128, 200, 256, 384],
    // Hero and gallery imagery carries the brand, so allow a high-fidelity
    // tier alongside a cheaper one for thumbnails.
    qualities: [60, 75, 90],
  },
  // CMS-uploaded media is served by the backend's local storage provider
  // (backend/src/storage/LocalStorageProvider.ts) at {BACKEND_ORIGIN}/uploads/**.
  // next/image's optimizer refuses to fetch any remote URL that resolves to
  // a loopback/private IP (a hardcoded SSRF guard — this can't be worked
  // around via `images.remotePatterns`). Proxying the path through Next's
  // own server makes it same-origin instead, which sidesteps that check
  // entirely. `src/lib/api/dto.ts` strips the backend origin from uploaded
  // URLs so components request the relative path below rather than the
  // absolute one.
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${BACKEND_ORIGIN}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
