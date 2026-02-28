import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://mozvendas-ten.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "MOZ VENDAS — Marketplace Seguro de Moçambique",
    template: "%s | MOZ VENDAS",
  },
  description: "O marketplace seguro de Moçambique. Compra e vende produtos em todas as províncias: Maputo, Beira, Nampula e mais. Anúncios gratuitos, sistema de mensagens e carrinho integrado.",
  keywords: [
    "marketplace moçambique", "comprar moçambique", "vender moçambique",
    "anúncios maputo", "produtos beira", "nampula mercado",
    "meticais", "MOZ VENDAS", "loja online moçambique",
    "compra e venda", "marketplace africa", "vendedor moçambique"
  ],
  authors: [{ name: "MOZ VENDAS", url: baseUrl }],
  creator: "MOZ VENDAS",
  publisher: "MOZ VENDAS",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_MZ",
    url: baseUrl,
    siteName: "MOZ VENDAS",
    title: "MOZ VENDAS — Marketplace Seguro de Moçambique",
    description: "Compra e vende produtos com confiança em todo Moçambique. Regista-te grátis e começa a anunciar hoje!",
    images: [
      {
        url: `${baseUrl}/logo.png`,
        width: 512,
        height: 512,
        alt: "MOZ VENDAS — Marketplace de Moçambique",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MOZ VENDAS — Marketplace Seguro de Moçambique",
    description: "Compra e vende produtos com confiança em todo Moçambique.",
    images: [`${baseUrl}/logo.png`],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: baseUrl,
  },
  category: "marketplace",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <head>
        <meta name="geo.region" content="MZ" />
        <meta name="geo.placename" content="Moçambique" />
        <meta name="language" content="Portuguese" />
        <meta name="revisit-after" content="7 days" />
        <meta name="rating" content="general" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}>
        <Providers>
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
