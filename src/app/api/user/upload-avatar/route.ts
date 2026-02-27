import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth/utils";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum ficheiro enviado" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Apenas imagens são permitidas" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Imagem muito grande. Máximo 5MB" }, { status: 400 });
    }

    // Upload para Cloudinary usando unsigned preset
    const cloudinaryForm = new FormData();
    cloudinaryForm.append("file", file);
    cloudinaryForm.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET!);
    cloudinaryForm.append("folder", "mozvendas/avatars");

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: cloudinaryForm }
    );

    if (!cloudinaryRes.ok) {
      throw new Error("Falha no upload para Cloudinary");
    }

    const cloudinaryData = await cloudinaryRes.json();
    const avatarUrl = cloudinaryData.secure_url;

    // Guardar no banco de dados
    await db.user.update({
      where: { id: user.id },
      data: { avatar: avatarUrl },
    });

    return NextResponse.json({ avatar: avatarUrl });
  } catch (error) {
    console.error("Erro upload avatar:", error);
    return NextResponse.json({ error: "Falha ao carregar imagem" }, { status: 500 });
  }
}
