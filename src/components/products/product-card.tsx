"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR as dateLocale } from "date-fns/locale";

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
  onClick?: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const images = JSON.parse(product.images) as string[];
  const mainImage = images[0] || "/placeholder.svg";

  return (
    <div
      onClick={onClick}
      className="cursor-pointer group"
    >
      <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200 bg-card">
        {/* Imagem quadrada como Facebook Marketplace */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={mainImage}
            alt={product.title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
          {product.category && (
            <Badge
              className="absolute top-2 left-2 text-xs"
              variant="secondary"
            >
              {product.category.name}
            </Badge>
          )}
        </div>

        {/* Info abaixo da imagem — compacto como Facebook */}
        <div className="p-2">
          <p className="font-bold text-base text-foreground">
            MT {product.price.toLocaleString("pt-MZ", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-foreground line-clamp-1 font-medium">
            {product.title}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {product.seller.name}
          </p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(product.createdAt), {
                addSuffix: true,
                locale: dateLocale,
              })}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              {product.views}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
