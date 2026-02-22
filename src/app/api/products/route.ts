import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const VALID_SORT = ["createdAt", "price", "views", "updatedAt"];
const VALID_ORDER = ["asc", "desc"];

const productSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  description: z.string().min(10).max(5000).trim(),
  price: z.number().positive().max(100_000_000),
  images: z.array(z.string().url()).min(1).max(10),
  categoryId: z.string().optional(),
  province: z.string().max(50).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12")));
    const skip = (page - 1) * limit;
    const search = searchParams.get("search")?.substring(0, 100) || "";
    const minPrice = Math.max(0, parseFloat(searchParams.get("minPrice") || "0"));
    const maxPrice = Math.min(100_000_000, parseFloat(searchParams.get("maxPrice") || "100000000"));
    const categoryId = searchParams.get("categoryId") || "";
    const province = searchParams.get("province") || "";
    const sellerId = searchParams.get("sellerId") || "";
    let sortBy = searchParams.get("sortBy") || "createdAt";
    let sortOrder = searchParams.get("sortOrder") || "desc";
    if (!VALID_SORT.includes(sortBy)) sortBy = "createdAt";
    if (!VALID_ORDER.includes(sortOrder)) sortOrder = "desc";

    const where: any = { isActive: true, price: { gte: minPrice, lte: maxPrice } };
    if (search) where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
    if (categoryId) where.categoryId = categoryId;
    if (province) where.province = province;
    if (sellerId) where.sellerId = sellerId;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { seller: { select: { id: true, name: true, avatar: true, role: true } }, category: true },
        orderBy: { [sortBy]: sortOrder },
        skip, take: limit,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({ products, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("Erro produtos GET:", error);
    return NextResponse.json({ error: "Falha ao buscar produtos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { requireSeller } = await import("@/lib/auth/utils");
    const user = await requireSeller();
    const body = await request.json();
    const data = productSchema.parse(body);

    const product = await db.product.create({
      data: { title: data.title, description: data.description, price: data.price, images: JSON.stringify(data.images), categoryId: data.categoryId, province: data.province, sellerId: user.id },
      include: { seller: { select: { id: true, name: true, avatar: true } }, category: true },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Validação falhou", details: error.issues }, { status: 400 });
    if (error instanceof Error && error.message.includes("necessário")) return NextResponse.json({ error: error.message }, { status: 401 });
    console.error("Erro produto POST:", error);
    return NextResponse.json({ error: "Falha ao criar produto" }, { status: 500 });
  }
}
