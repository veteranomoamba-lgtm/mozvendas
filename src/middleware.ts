import { NextRequest, NextResponse } from "next/server";

// In-memory rate limit store (resets on cold start / redeploy)
const store = new Map<string, { count: number; reset: number }>();
let lastCleanup = Date.now();

function getIP(req: NextRequest): string {
  return (req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown").trim();
}

function allow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  // Cleanup every 5 min
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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ip = getIP(req);

  // — Rate Limiting —
  if (pathname.startsWith("/api/auth/register")) {
    if (!allow(`reg:${ip}`, 5, 900_000))
      return NextResponse.json({ error: "Demasiadas tentativas. Tente em 15 min." }, { status: 429 });
  }
  if (pathname.includes("/api/auth/callback") || pathname.includes("/api/auth/signin")) {
    if (!allow(`login:${ip}`, 10, 900_000))
      return NextResponse.json({ error: "Demasiadas tentativas de login. Aguarde 15 min." }, { status: 429 });
  }
  if (pathname.startsWith("/api/upload")) {
    if (!allow(`upload:${ip}`, 20, 3_600_000))
      return NextResponse.json({ error: "Limite de uploads atingido. Tente em 1 hora." }, { status: 429 });
  }
  if (pathname.startsWith("/api/") && req.method !== "GET") {
    if (!allow(`api:${ip}`, 120, 60_000))
      return NextResponse.json({ error: "Demasiados pedidos. Aguarde um momento." }, { status: 429 });
  }

  const res = NextResponse.next();

  // — Security Headers —
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.headers.set("Content-Security-Policy", [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https: http:",
    "connect-src 'self' https://api.cloudinary.com",
    "frame-ancestors 'none'",
  ].join("; "));

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.svg|robots.txt).*)"],
};
