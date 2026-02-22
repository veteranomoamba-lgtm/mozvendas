import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const PROVINCES = ["Maputo Cidade","Maputo Província","Gaza","Inhambane","Sofala","Manica","Tete","Zambézia","Nampula","Cabo Delgado","Niassa"];

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100).trim(),
  email: z.string().email("Email inválido").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(128)
    .regex(/[A-Z]/, "Inclua pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "Inclua pelo menos um número"),
  role: z.enum(["BUYER", "SELLER"]).default("BUYER"),
  phone: z.string().max(20).optional(),
  province: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const exists = await db.user.findUnique({ where: { email: data.email } });
    if (exists) return NextResponse.json({ error: "Já existe uma conta com este email" }, { status: 400 });

    const hashed = await bcrypt.hash(data.password, 12);
    const user = await db.user.create({
      data: { name: data.name, email: data.email, password: hashed, role: data.role, phone: data.phone, province: data.province },
    });

    return NextResponse.json(
      { message: "Conta criada com sucesso!", user: { id: user.id, name: user.name, email: user.email, role: user.role } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Validação falhou", details: error.issues }, { status: 400 });
    console.error("Erro registo:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
