import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, requireAuth } from "@/lib/auth/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get("sellerId");
    if (!sellerId) return NextResponse.json({ average: null, total: 0 });

    const ratings = await db.rating.findMany({ where: { sellerId } });
    const total = ratings.length;
    const average = total > 0 ? ratings.reduce((sum, r) => sum + r.stars, 0) / total : null;

    const user = await getCurrentUser();
    const userRating = user ? ratings.find((r) => r.buyerId === user.id)?.stars || null : null;

    return NextResponse.json({ average, total, userRating });
  } catch {
    return NextResponse.json({ average: null, total: 0 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { sellerId, rating } = await request.json();
    if (!sellerId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    // Upsert - actualiza se já existir
    const result = await db.rating.upsert({
      where: { buyerId_sellerId: { buyerId: user.id, sellerId } },
      update: { stars: rating },
      create: { buyerId: user.id, sellerId, stars: rating },
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: "Falha" }, { status: 500 });
  }
}
