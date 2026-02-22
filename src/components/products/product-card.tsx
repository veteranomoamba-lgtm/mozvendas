"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR as dateLocale } from "date-fns/locale";
import ptBR from "@/lib/translations/pt-BR";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    images: string;
    createdAt: string | Date;
    views: number;
    seller: {
      id: string;
      name: string | null;
      avatar: string | null;
    };
    category?: {
      id: string;
      name: string;
    } | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const images = JSON.parse(product.images) as string[];
  const mainImage = images[0] || "/placeholder.svg";

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={mainImage}
            alt={product.title}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
          />
          {product.category && (
            <Badge className="absolute top-2 left-2" variant="secondary">
              {product.category.name}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg line-clamp-1 mb-1">
            {product.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {product.description}
          </p>
          <div className="flex items-center gap-1 text-xl font-bold text-primary">
            <DollarSign className="h-5 w-5" />
            MT {product.price.toLocaleString("pt-MZ", { minimumFractionDigits: 2 })}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={product.seller.avatar || ""} />
              <AvatarFallback>
                {product.seller.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {product.seller.name}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {product.views}
            </div>
            <span>
              {formatDistanceToNow(new Date(product.createdAt), {
                addSuffix: true,
                locale: dateLocale,
              })}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
