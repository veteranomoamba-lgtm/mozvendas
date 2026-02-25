"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, X, ImagePlus } from "lucide-react";
import ptBR from "@/lib/translations/pt-BR";

const PROVINCES = ["Maputo Cidade","Maputo Província","Gaza","Inhambane","Sofala","Manica","Tete","Zambézia","Nampula","Cabo Delgado","Niassa"];

const productSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres").max(200),
  description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres").max(5000),
  price: z.number().positive("O preço deve ser positivo").max(100_000_000),
  categoryId: z.string().optional(),
  province: z.string().optional(),
  images: z.array(z.string()).min(1, ptBR.products.atLeastOneImage),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: Category[];
  initialData?: {
    id: string;
    title: string;
    description: string;
    price: number;
    categoryId?: string;
    province?: string;
    images: string[];
  };
  onSubmit: (data: ProductFormData) => Promise<void>;
  isEditing?: boolean;
}

export function ProductForm({
  categories,
  initialData,
  onSubmit,
  isEditing = false,
}: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      categoryId: initialData?.categoryId || "",
      province: initialData?.province || "",
      images: initialData?.images || [],
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Falha ao enviar imagens");
      }

      const data = await response.json();
      const newImages = [...images, ...data.urls];
      setImages(newImages);
      form.setValue("images", newImages);
    } catch {
      toast.error("Falha ao enviar imagens");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    form.setValue("images", newImages);
  };

  const handleSubmit = async (data: ProductFormData) => {
    if (images.length === 0) {
      toast.error(ptBR.products.atLeastOneImage);
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({ ...data, images });
    } catch {
      toast.error(ptBR.auth.somethingWentWrong);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? ptBR.products.editProduct : ptBR.products.createProduct}</CardTitle>
        <CardDescription>
          Preencha os detalhes abaixo para {isEditing ? "atualizar seu" : "anunciar um novo"} produto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{ptBR.products.productTitle} *</Label>
            <Input
              id="title"
              placeholder={ptBR.products.productTitlePlaceholder}
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{ptBR.products.description} *</Label>
            <Textarea
              id="description"
              placeholder={ptBR.products.descriptionPlaceholder}
              rows={5}
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">{ptBR.products.price} (MT) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder={ptBR.products.pricePlaceholder}
              {...form.register("price", { valueAsNumber: true })}
            />
            {form.formState.errors.price && (
              <p className="text-sm text-destructive">
                {form.formState.errors.price.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">{ptBR.products.category}</Label>
            <Select
              onValueChange={(value) => form.setValue("categoryId", value)}
              defaultValue={form.getValues("categoryId")}
            >
              <SelectTrigger>
                <SelectValue placeholder={ptBR.products.selectCategory} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Province */}
          <div className="space-y-2">
            <Label>Província *</Label>
            <Select
              onValueChange={(value) => form.setValue("province", value)}
              defaultValue={form.getValues("province")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione a sua província" />
              </SelectTrigger>
              <SelectContent>
                {PROVINCES.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>{ptBR.products.images} *</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden border bg-muted"
                >
                  <img
                    src={image}
                    alt={`Imagem do produto ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                {isUploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                )}
                <span className="text-xs text-muted-foreground">{ptBR.products.addImage}</span>
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              {ptBR.products.supportedFormats}
            </p>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? ptBR.products.updateButton : ptBR.products.createButton}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
