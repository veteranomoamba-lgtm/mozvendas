import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { requireAdmin } = await import("@/lib/auth/utils");
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.substring(0, 100) || "";
    const role = searchParams.get("role") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
    if (role && ["BUYER","SELLER","ADMIN"].includes(role)) where.role = role;

    const [users, total] = await Promise.all([
      db.user.findMany({ where, select: { id: true, name: true, email: true, role: true, isBanned: true, bannedReason: true, avatar: true, province: true, createdAt: true, _count: { select: { products: true } } }, orderBy: { createdAt: "desc" }, skip, take: limit }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({ users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao buscar utilizadores" }, { status: 500 });
  }
}
