import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  role: z.enum(["BUYER","SELLER","ADMIN"]).optional(),
  isBanned: z.boolean().optional(),
  bannedReason: z.string().max(500).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { requireAdmin } = await import("@/lib/auth/utils");
    const admin = await requireAdmin();
    const { id } = await params;
    if (id === admin.id) return NextResponse.json({ error: "Não pode modificar a sua própria conta" }, { status: 400 });
    const data = schema.parse(await req.json());
    const updated = await db.user.update({ where: { id }, data, select: { id: true, name: true, email: true, role: true, isBanned: true, bannedReason: true } });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Falha ao actualizar utilizador" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { requireAdmin } = await import("@/lib/auth/utils");
    const admin = await requireAdmin();
    const { id } = await params;
    if (id === admin.id) return NextResponse.json({ error: "Não pode eliminar a sua própria conta" }, { status: 400 });
    await db.user.delete({ where: { id } });
    return NextResponse.json({ message: "Utilizador eliminado" });
  } catch (error) {
    return NextResponse.json({ error: "Falha ao eliminar utilizador" }, { status: 500 });
  }
}
