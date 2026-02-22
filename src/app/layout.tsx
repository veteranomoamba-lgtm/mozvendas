export const dynamic = "force-dynamic";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mozvendas.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: { default: "MOZ VENDAS — Marketplace Seguro de Moçambique", template: "%s | MOZ VENDAS" },
  description: "O marketplace seguro de Moçambique. Compra e vende produtos em todas as províncias: Maputo, Beira, Nampula e mais. Sistema de carrinho e mensagens integrado.",
  keywords: ["marketplace", "moçambique", "comprar", "vender", "maputo", "beira", "nampula", "meticais", "anúncios", "MOZ VENDAS"],
  authors: [{ name: "MOZ VENDAS" }],
  creator: "MOZ VENDAS",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website", locale: "pt_MZ", url: baseUrl, siteName: "MOZ VENDAS",
    title: "MOZ VENDAS — Marketplace Seguro de Moçambique",
    description: "Compra e vende produtos com confiança em todo Moçambique.",
  },
  icons: { icon: "/logo.svg", apple: "/logo.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}>
        <Providers>
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
