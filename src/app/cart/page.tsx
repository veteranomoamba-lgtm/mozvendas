import { CartView } from "@/components/cart/cart-view";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Carrinho" };

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <CartView />
      </main>
      <Footer />
    </div>
  );
}
