import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Get all categories
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Falha ao buscar categorias" },
      { status: 500 }
    );
  }
}

// Create category (admin only)
export async function POST(request: NextRequest) {
  try {
    const { requireAdmin } = await import("@/lib/auth/utils");
    await requireAdmin();

    const body = await request.json();
    const { name, description, icon } = body;

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const category = await db.category.create({
      data: {
        name,
        slug,
        description,
        icon,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Falha ao criar categoria" },
      { status: 500 }
    );
  }
}
