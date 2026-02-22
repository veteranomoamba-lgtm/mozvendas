import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { requireAuth } = await import("@/lib/auth/utils");
    const user = await requireAuth();
    const { id } = await params;

    const item = await db.cartItem.findFirst({ where: { id, userId: user.id } });
    if (!item) return NextResponse.json({ error: "Item não encontrado no carrinho" }, { status: 404 });

    await db.cartItem.delete({ where: { id } });
    return NextResponse.json({ message: "Item removido do carrinho" });
  } catch (error) {
    console.error("Erro remover item:", error);
    return NextResponse.json({ error: "Falha ao remover item" }, { status: 500 });
  }
}
