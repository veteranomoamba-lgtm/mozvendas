"use client";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProductForm } from "@/components/products/product-form";
import { Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

interface Category { id: string; name: string; slug: string; }

export default function NewProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);

  if (status === "loading") return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!session) { redirect("/?auth=login"); }

  const isSeller = session.user.role === "SELLER" || session.user.role === "ADMIN";
  if (!isSeller) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="max-w-md mx-auto text-center py-16 space-y-4">
            <Shield className="h-16 w-16 mx-auto text-muted-foreground opacity-30" />
            <h2 className="text-xl font-semibold">Acesso de Vendedor Necessário</h2>
            <p className="text-muted-foreground">Para publicar anúncios precisa de uma conta de vendedor. Crie uma nova conta como vendedor.</p>
            <Button asChild><Link href="/?auth=register">Criar conta de Vendedor</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(setCategories);
  }, []);

  const handleSubmit = async (data: any) => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Falha ao criar produto");
    }
    toast.success("Produto publicado com sucesso!");
    router.push("/my-products");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Publicar Novo Anúncio</h1>
          <ProductForm categories={categories} onSubmit={handleSubmit} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
