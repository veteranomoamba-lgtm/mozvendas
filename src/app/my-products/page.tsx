"use client";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Package, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

interface Product { id: string; title: string; description: string; price: number; images: string; views: number; createdAt: string; seller: { id: string; name: string | null; avatar: string | null; role: string }; category?: { id: string; name: string } | null; }

export default function MyProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  if (status === "loading") return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!session) { redirect("/?auth=login"); }

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/products?sellerId=${session.user.id}&limit=50`)
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .finally(() => setIsLoading(false));
  }, [session?.user?.id]);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem a certeza que quer eliminar este produto?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Produto eliminado.");
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch { toast.error("Falha ao eliminar produto."); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Package className="h-6 w-6" /> Os Meus Produtos</h1>
          <Button asChild><Link href="/products/new"><Plus className="h-4 w-4 mr-2" /> Novo Anúncio</Link></Button>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[300px]"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Package className="h-16 w-16 mx-auto text-muted-foreground opacity-30" />
            <h2 className="text-xl font-semibold">Ainda não tem produtos</h2>
            <p className="text-muted-foreground">Publique o seu primeiro anúncio agora!</p>
            <Button asChild><Link href="/products/new"><Plus className="h-4 w-4 mr-2" /> Criar Anúncio</Link></Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="relative group">
                <ProductCard product={product} />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="secondary" onClick={() => router.push(`/products/${product.id}/edit`)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
