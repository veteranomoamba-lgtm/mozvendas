import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createAdminUser } from "@/lib/auth/utils";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    const { searchParams } = new URL(request.url);
    if (searchParams.get("token") !== process.env.SEED_SECRET) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  try {
    await createAdminUser();

    const categories = [
      { name: "Electrónica", slug: "electronica", icon: "💻", description: "Telemóveis, computadores, televisões" },
      { name: "Moda & Vestuário", slug: "moda-vestuario", icon: "👗", description: "Roupa, calçado, acessórios" },
      { name: "Casa & Jardim", slug: "casa-jardim", icon: "🏠", description: "Mobiliário, decoração, electrodomésticos" },
      { name: "Automóveis", slug: "automoveis", icon: "🚗", description: "Carros, peças, acessórios" },
      { name: "Motos & Bicicletas", slug: "motos-bicicletas", icon: "🏍️", description: "Motorizadas, bicicletas, peças" },
      { name: "Imóveis", slug: "imoveis", icon: "🏢", description: "Casas, apartamentos, terrenos" },
      { name: "Alimentação", slug: "alimentacao", icon: "🍎", description: "Produtos alimentares, bebidas" },
      { name: "Materiais de Construção", slug: "construcao", icon: "🧱", description: "Cimento, ferro, madeira" },
      { name: "Serviços", slug: "servicos", icon: "🔧", description: "Canalizador, electricista, mecânico" },
      { name: "Outros", slug: "outros", icon: "📦", description: "Tudo o que não se encaixa nas outras categorias" },
    ];

    for (const cat of categories) {
      await db.category.upsert({ where: { slug: cat.slug }, update: {}, create: cat });
    }

    return NextResponse.json({ message: "✅ Base de dados inicializada!", categories: categories.length });
  } catch (error) {
    console.error("Erro seed:", error);
    return NextResponse.json({ error: "Falha na inicialização" }, { status: 500 });
  }
}
