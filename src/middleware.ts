import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// In-memory rate limit store
const store = new Map<string, { count: number; reset: number }>();
let lastCleanup = Date.now();

function getIP(req: NextRequest): string {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0] ??
    "unknown"
  ).trim();
}

function allow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  if (now - lastCleanup > 300_000) {
    for (const [k, v] of store) if (now > v.reset) store.delete(k);
    lastCleanup = now;
  }
  const rec = store.get(key);
  if (!rec || now > rec.reset) { store.set(key, { count: 1, reset: now + windowMs }); return true; }
  if (rec.count >= max) return false;
  rec.count++;
  return true;
}

// Bots maliciosos
const BAD_BOTS = [
  "sqlmap", "nikto", "nmap", "masscan", "zgrab",
  "python-requests", "go-http-client", "dirbuster",
  "hydra", "metasploit", "scrapy",
];

// Paths de ataque
const BLOCKED_PATHS = [
  "/wp-admin", "/wp-login", "/.env", "/admin.php",
  "/phpmyadmin", "/xmlrpc.php", "/.git", "/config.php",
  "/shell.php", "/eval.php", "/backdoor",
];

// Páginas públicas — não precisam de login
const PUBLIC_PATHS = [
  "/",
  "/about",
  "/privacy",
  "/terms",
  "/anti-fraud",
  "/api/auth",
  "/api/products",
  "/api/seed",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = getIP(req);
  const ua = (req.headers.get("user-agent") ?? "").toLowerCase();

  // — Bloquear paths de ataque —
  for (const bad of BLOCKED_PATHS) {
    if (pathname.toLowerCase().includes(bad)) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  // — Bloquear bots maliciosos —
  for (const bot of BAD_BOTS) {
    if (ua.includes(bot)) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  // — Bloquear requests sem User-Agent nas APIs —
  if (!req.headers.get("user-agent") && pathname.startsWith("/api/")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // — Rate Limiting —
  if (pathname.startsWith("/api/auth/register")) {
    if (!allow(`reg:${ip}`, 5, 900_000))
      return NextResponse.json({ error: "Demasiadas tentativas. Tente em 15 min." }, { status: 429 });
  }
  if (pathname.includes("/api/auth/callback") || pathname.includes("/api/auth/signin")) {
    if (!allow(`login:${ip}`, 10, 900_000))
      return NextResponse.json({ error: "Demasiadas tentativas. Aguarde 15 min." }, { status: 429 });
  }
  if (pathname.startsWith("/api/") && req.method !== "GET") {
    if (!allow(`api:${ip}`, 150, 60_000))
      return NextResponse.json({ error: "Demasiados pedidos. Aguarde um momento." }, { status: 429 });
  }

  // — Protecção de rotas — só para páginas (não APIs) —
  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith("/api/auth"));
  const isStaticFile = pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.startsWith("/logo") || pathname.includes(".");

  if (!isPublic && !isStaticFile) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      // Redirecionar para login
      const loginUrl = new URL("/?auth=login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // — Security Headers —
  const res = NextResponse.next();
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  res.headers.set("Content-Security-Policy", [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com",
    "connect-src 'self' https://api.cloudinary.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "));

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png|apple-icon.png|robots.txt|sitemap.xml).*)"],
};
