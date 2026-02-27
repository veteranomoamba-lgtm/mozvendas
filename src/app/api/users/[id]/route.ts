import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await db.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, avatar: true, role: true },
    });
    if (!user) return NextResponse.json({ error: "Utilizador não encontrado" }, { status: 404 });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Erro" }, { status: 500 });
  }
}
