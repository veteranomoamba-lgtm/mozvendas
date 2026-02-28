import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  serverExternalPackages: ["@prisma/client", "bcryptjs"],

  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  // Desabilitar informação da versão Next.js no header
  poweredByHeader: false,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],
    // Limitar tamanhos de imagem para evitar ataques
    deviceSizes: [640, 750, 828, 1080, 1200],
    minimumCacheTTL: 60,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Powered-By", value: "" },
          // Esconder tecnologia usada
          { key: "Server", value: "MozVendas" },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
      {
        // Cache longo para assets estáticos
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Cache para imagens públicas
        source: "/(.*)\\.(png|jpg|jpeg|gif|ico|svg|webp)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // Proteger rota seed sem token
      {
        source: "/api/seed",
        destination: "/",
        permanent: false,
        missing: [{ type: "query", key: "token" }],
      },
      // Redirecionar HTTP para HTTPS
      {
        source: "/(.*)",
        has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: "https://mozvendas-ten.vercel.app/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
