import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  bio: z.string().max(500).trim().optional(),
  phone: z.string().max(20).optional(),
  province: z.string().optional(),
});

export async function GET() {
  try {
    const { requireAuth } = await import("@/lib/auth/utils");
    const user = await requireAuth();
    const profile = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, bio: true, phone: true, province: true, avatar: true, role: true, createdAt: true },
    });
    return NextResponse.json(profile);
  } catch {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { requireAuth } = await import("@/lib/auth/utils");
    const user = await requireAuth();
    const validated = profileSchema.parse(await request.json());
    const updated = await db.user.update({
      where: { id: user.id },
      data: { ...(validated.name && { name: validated.name }), ...(validated.bio !== undefined && { bio: validated.bio }), ...(validated.phone && { phone: validated.phone }), ...(validated.province && { province: validated.province }) },
      select: { id: true, name: true, email: true, bio: true, phone: true, province: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Validação falhou" }, { status: 400 });
    return NextResponse.json({ error: "Falha ao actualizar perfil" }, { status: 500 });
  }
}
