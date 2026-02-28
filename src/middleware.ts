import { NextRequest, NextResponse } from "next/server";

// In-memory rate limit store
const store = new Map<string, { count: number; reset: number }>();
let lastCleanup = Date.now();

function getIP(req: NextRequest): string {
  // Suporta Cloudflare (CF-Connecting-IP tem prioridade)
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

// Bots maliciosos conhecidos
const BAD_BOTS = [
  "sqlmap", "nikto", "nmap", "masscan", "zgrab",
  "python-requests", "go-http-client", "curl/7",
  "dirbuster", "hydra", "metasploit", "scrapy",
];

// Paths que bots tentam atacar
const BLOCKED_PATHS = [
  "/wp-admin", "/wp-login", "/.env", "/admin.php",
  "/phpmyadmin", "/xmlrpc.php", "/.git", "/config.php",
  "/shell.php", "/eval.php", "/backdoor",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = getIP(req);
  const ua = (req.headers.get("user-agent") ?? "").toLowerCase();
  const country = req.headers.get("cf-ipcountry") ?? "";

  // — Bloquear paths de ataque —
  for (const bad of BLOCKED_PATHS) {
    if (pathname.toLowerCase().includes(bad)) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  // — Bloquear bots maliciosos por User-Agent —
  for (const bot of BAD_BOTS) {
    if (ua.includes(bot)) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  // — Bloquear requests sem User-Agent (bots primitivos) —
  if (!req.headers.get("user-agent") && pathname.startsWith("/api/")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // — Rate Limiting —
  // Registo: 5 tentativas por 15 min
  if (pathname.startsWith("/api/auth/register")) {
    if (!allow(`reg:${ip}`, 5, 900_000))
      return NextResponse.json(
        { error: "Demasiadas tentativas. Tente em 15 min." },
        { status: 429 }
      );
  }

  // Login: 10 tentativas por 15 min
  if (pathname.includes("/api/auth/callback") || pathname.includes("/api/auth/signin")) {
    if (!allow(`login:${ip}`, 10, 900_000))
      return NextResponse.json(
        { error: "Demasiadas tentativas de login. Aguarde 15 min." },
        { status: 429 }
      );
  }

  // Upload: 20 por hora
  if (pathname.startsWith("/api/upload") || pathname.includes("upload-avatar")) {
    if (!allow(`upload:${ip}`, 20, 3_600_000))
      return NextResponse.json(
        { error: "Limite de uploads atingido. Tente em 1 hora." },
        { status: 429 }
      );
  }

  // APIs gerais: 150 por minuto
  if (pathname.startsWith("/api/") && req.method !== "GET") {
    if (!allow(`api:${ip}`, 150, 60_000))
      return NextResponse.json(
        { error: "Demasiados pedidos. Aguarde um momento." },
        { status: 429 }
      );
  }

  // GET APIs: 300 por minuto
  if (pathname.startsWith("/api/") && req.method === "GET") {
    if (!allow(`get:${ip}`, 300, 60_000))
      return NextResponse.json(
        { error: "Demasiados pedidos." },
        { status: 429 }
      );
  }

  const res = NextResponse.next();

  // — Security Headers —
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  res.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  // Content Security Policy
  res.headers.set("Content-Security-Policy", [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://res.cloudinary.com https://lh3.googleusercontent.com",
    "connect-src 'self' https://api.cloudinary.com https://cloudflareinsights.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; "));

  // Adicionar IP do país para logs (via Cloudflare)
  if (country) res.headers.set("X-Country", country);

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png|robots.txt|sitemap.xml).*)"],
};
