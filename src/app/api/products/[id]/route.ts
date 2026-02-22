import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const productSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  price: z.number().positive("Price must be positive"),
  images: z.array(z.string()).min(1, "Pelo menos uma imagem é necessária"),
  categoryId: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const product = await db.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true,
            bio: true,
            createdAt: true,
          },
        },
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    // Increment view count
    await db.product.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Falha ao buscar produto" },
      { status: 500 }
    );
  }
}

// Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { checkOwnership } = await import("@/lib/auth/utils");
    
    // Get product to check ownership
    const product = await db.product.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    await checkOwnership(product.sellerId);

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    const updatedProduct = await db.product.update({
      where: { id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        price: validatedData.price,
        images: JSON.stringify(validatedData.images),
        categoryId: validatedData.categoryId,
        isActive: validatedData.isActive,
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        category: true,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Falha ao actualizar produto" },
      { status: 500 }
    );
  }
}

// Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { checkOwnership } = await import("@/lib/auth/utils");
    
    // Get product to check ownership
    const product = await db.product.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    await checkOwnership(product.sellerId);

    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Produto eliminado com sucesso" });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Falha ao eliminar produto" },
      { status: 500 }
    );
  }
}
