"use client";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProductForm } from "@/components/products/product-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Category { id: string; name: string; }

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productId, setProductId] = useState<string>("");

  useEffect(() => {
    params.then(p => setProductId(p.id));
  }, [params]);

  if (status === "loading") return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!session) { redirect("/?auth=login"); }

  useEffect(() => {
    if (!productId || !session) return;
    Promise.all([
      fetch(`/api/products/${productId}`).then(r => r.json()),
      fetch("/api/categories").then(r => r.json()),
    ]).then(([p, c]) => {
      if (p.error) { toast.error("Produto não encontrado."); router.push("/my-products"); return; }
      if (p.sellerId !== session?.user?.id && session?.user?.role !== "ADMIN") {
        toast.error("Sem permissão para editar este produto.");
        router.push("/my-products"); return;
      }
      setProduct({ ...p, images: JSON.parse(p.images || "[]") });
      setCategories(c);
    }).finally(() => setIsLoading(false));
  }, [productId, session]);

  const handleSubmit = async (data: any) => {
    const res = await fetch(`/api/products/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, images: data.images }),
    });
    if (!res.ok) throw new Error("Falha ao actualizar produto");
    toast.success("Produto actualizado!");
    router.push("/my-products");
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Editar Produto</h1>
          {product && <ProductForm categories={categories} initialData={product} onSubmit={handleSubmit} isEditing />}
        </div>
      </main>
      <Footer />
    </div>
  );
}
