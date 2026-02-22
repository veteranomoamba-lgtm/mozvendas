"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ShoppingCart,
  Trash2,
  Package,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import ptBR from "@/lib/translations/pt-BR";
import { useCartStore, CartItem } from "@/lib/store/cart";

export function CartView() {
  const { data: session } = useSession();
  const { items, setItems, removeItem, setLoading, isLoading } = useCartStore();
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchCart();
    }
  }, [session]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemId: string) => {
    setIsRemoving(itemId);
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        removeItem(itemId);
        toast.success(ptBR.productDetail.removedFromCart);
      } else {
        toast.error("Erro ao remover item");
      }
    } catch (error) {
      toast.error("Erro ao remover item");
    } finally {
      setIsRemoving(null);
    }
  };

  const handleClearCart = async () => {
    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
      });

      if (response.ok) {
        setItems([]);
        toast.success(ptBR.cart.cartCleared);
      }
    } catch (error) {
      toast.error("Erro ao limpar carrinho");
    }
  };

  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price,
    0
  );

  if (!session?.user) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            {ptBR.productDetail.loginToAddCart}
          </p>
          <Button asChild>
            <Link href="/?auth=login">{ptBR.nav.signIn}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          {ptBR.cart.title}
          {items.length > 0 && (
            <Badge variant="secondary">{items.length} {ptBR.cart.items}</Badge>
          )}
        </h1>
        {items.length > 0 && (
          <Button variant="outline" onClick={handleClearCart}>
            <Trash2 className="h-4 w-4 mr-2" />
            {ptBR.cart.clearCart}
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">{ptBR.cart.empty}</h2>
            <p className="text-muted-foreground mb-4">{ptBR.cart.emptyDescription}</p>
            <Button asChild>
              <Link href="/">
                <Package className="h-4 w-4 mr-2" />
                {ptBR.cart.continueShopping}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const images = JSON.parse(item.product.images) as string[];
              const mainImage = images[0] || "/placeholder.svg";

              return (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={mainImage}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.product.id}`}
                          className="font-semibold hover:underline line-clamp-1"
                        >
                          {item.product.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={item.product.seller.avatar || ""} />
                            <AvatarFallback>
                              {item.product.seller.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-muted-foreground">
                            {item.product.seller.name}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-primary mt-2">
                          MT {item.product.price.toLocaleString("pt-MZ", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="flex items-start">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemove(item.id)}
                          disabled={isRemoving === item.id}
                        >
                          {isRemoving === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {items.length} {ptBR.cart.items}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>{ptBR.cart.total}:</span>
                  <span className="text-primary">
                    MT {totalPrice.toLocaleString("pt-MZ", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <Button className="w-full" size="lg">
                  {ptBR.cart.checkout}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  {ptBR.cart.checkoutComingSoon}
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {ptBR.cart.continueShopping}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
