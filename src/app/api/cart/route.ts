import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const addSchema = z.object({
  productId: z.string().min(1),
});

export async function GET() {
  try {
    const { requireAuth } = await import("@/lib/auth/utils");
    const user = await requireAuth();

    const items = await db.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            seller: { select: { id: true, name: true, avatar: true } },
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    if (error instanceof Error && error.message.includes("necessária")) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    console.error("Erro carrinho GET:", error);
    return NextResponse.json({ error: "Falha ao carregar carrinho" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { requireAuth } = await import("@/lib/auth/utils");
    const user = await requireAuth();

    const body = await request.json();
    const { productId } = addSchema.parse(body);

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }
    if (product.sellerId === user.id) {
      return NextResponse.json({ error: "Não pode adicionar o seu próprio produto ao carrinho" }, { status: 400 });
    }

    // Check if already in cart (MongoDB unique constraint)
    const existing = await db.cartItem.findFirst({ where: { userId: user.id, productId } });
    if (existing) {
      return NextResponse.json({ error: "Produto já está no carrinho" }, { status: 400 });
    }

    const item = await db.cartItem.create({
      data: { userId: user.id, productId },
      include: {
        product: { include: { seller: { select: { id: true, name: true, avatar: true } } } },
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    console.error("Erro carrinho POST:", error);
    return NextResponse.json({ error: "Falha ao adicionar ao carrinho" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { requireAuth } = await import("@/lib/auth/utils");
    const user = await requireAuth();
    await db.cartItem.deleteMany({ where: { userId: user.id } });
    return NextResponse.json({ message: "Carrinho limpo com sucesso" });
  } catch (error) {
    console.error("Erro limpar carrinho:", error);
    return NextResponse.json({ error: "Falha ao limpar carrinho" }, { status: 500 });
  }
}
