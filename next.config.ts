import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ output: "standalone" removido — Vercel não precisa
  reactStrictMode: true,
  // ✅ Correcto no Next.js 15 (saiu do experimental)
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: [
        { key: "X-DNS-Prefetch-Control", value: "on" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
      ]},
      { source: "/api/(.*)", headers: [{ key: "Cache-Control", value: "no-store" }]},
    ];
  },
  async redirects() {
    return [
      { source: "/api/seed", destination: "/", permanent: false, missing: [{ type: "query", key: "token" }] },
    ];
  },
};

export default nextConfig;
