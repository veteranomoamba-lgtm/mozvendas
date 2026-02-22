import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { requireAuth } = await import("@/lib/auth/utils");
    await requireAuth();

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return NextResponse.json({ error: "Serviço de upload não configurado. Configure CLOUDINARY_CLOUD_NAME e CLOUDINARY_UPLOAD_PRESET." }, { status: 503 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files?.length) return NextResponse.json({ error: "Nenhum ficheiro enviado" }, { status: 400 });
    if (files.length > 5) return NextResponse.json({ error: "Máximo 5 imagens por vez" }, { status: 400 });

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024;
    const urls: string[] = [];

    for (const file of files) {
      if (!allowed.includes(file.type))
        return NextResponse.json({ error: `Tipo inválido: ${file.type}. Use JPG, PNG ou WebP.` }, { status: 400 });
      if (file.size > maxSize)
        return NextResponse.json({ error: `${file.name} é demasiado grande (máx. 5MB).` }, { status: 400 });

      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", uploadPreset);
      form.append("folder", "mozvendas");

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: form });
      if (!res.ok) {
        console.error("Cloudinary error:", await res.text());
        return NextResponse.json({ error: "Falha ao fazer upload da imagem" }, { status: 500 });
      }
      const data = await res.json();
      urls.push(data.secure_url);
    }

    return NextResponse.json({ urls }, { status: 201 });
  } catch (error) {
    console.error("Erro upload:", error);
    return NextResponse.json({ error: "Falha no upload" }, { status: 500 });
  }
}
