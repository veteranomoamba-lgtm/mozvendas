"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Search, SlidersHorizontal, X } from "lucide-react";
import ptBR from "@/lib/translations/pt-BR";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
  filters: {
    search: string;
    minPrice: number;
    maxPrice: number;
    categoryId: string;
    sortBy: string;
    sortOrder: string;
  };
  onFiltersChange: (filters: Partial<ProductFiltersProps["filters"]>) => void;
}

function FilterContentInner({
  localFilters,
  setLocalFilters,
  categories,
  handleResetFilters,
  handleApplyFilters,
}: {
  localFilters: ProductFiltersProps["filters"];
  setLocalFilters: React.Dispatch<React.SetStateAction<ProductFiltersProps["filters"]>>;
  categories: Category[];
  handleResetFilters: () => void;
  handleApplyFilters: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label htmlFor="search">{ptBR.filters.search}</Label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder={ptBR.filters.searchPlaceholder}
            className="pl-10"
            value={localFilters.search}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, search: e.target.value })
            }
          />
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <Label>{ptBR.filters.priceRange}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder={ptBR.filters.min}
            value={localFilters.minPrice || ""}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                minPrice: Number(e.target.value) || 0,
              })
            }
            className="w-full"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder={ptBR.filters.max}
            value={localFilters.maxPrice === 100000 ? "" : localFilters.maxPrice}
            onChange={(e) =>
              setLocalFilters({
                ...localFilters,
                maxPrice: Number(e.target.value) || 100000,
              })
            }
            className="w-full"
          />
        </div>
        <Slider
          value={[localFilters.minPrice, localFilters.maxPrice]}
          onValueChange={(value) =>
            setLocalFilters({
              ...localFilters,
              minPrice: value[0],
              maxPrice: value[1],
            })
          }
          max={100000}
          step={100}
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>{ptBR.products.category}</Label>
        <Select
          value={localFilters.categoryId || "all"}
          onValueChange={(value) =>
            setLocalFilters({
              ...localFilters,
              categoryId: value === "all" ? "" : value,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={ptBR.filters.allCategories} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{ptBR.filters.allCategories}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <Label>{ptBR.filters.sortBy}</Label>
        <div className="flex gap-2">
          <Select
            value={localFilters.sortBy}
            onValueChange={(value) =>
              setLocalFilters({ ...localFilters, sortBy: value })
            }
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">{ptBR.filters.dateListed}</SelectItem>
              <SelectItem value="price">{ptBR.filters.priceOption}</SelectItem>
              <SelectItem value="views">{ptBR.filters.popularity}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={localFilters.sortOrder}
            onValueChange={(value) =>
              setLocalFilters({ ...localFilters, sortOrder: value })
            }
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">{ptBR.filters.descending}</SelectItem>
              <SelectItem value="asc">{ptBR.filters.ascending}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleResetFilters} className="flex-1">
          <X className="h-4 w-4 mr-2" />
          {ptBR.filters.reset}
        </Button>
        <Button onClick={handleApplyFilters} className="flex-1">
          {ptBR.filters.applyFilters}
        </Button>
      </div>
    </div>
  );
}

export function ProductFilters({
  categories,
  filters,
  onFiltersChange,
}: ProductFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      search: "",
      minPrice: 0,
      maxPrice: 100000,
      categoryId: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <div className="space-y-4">
      {/* Desktop Filters */}
      <div className="hidden md:block">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <Label htmlFor="desktop-search" className="sr-only">
              {ptBR.filters.search}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="desktop-search"
                placeholder={ptBR.filters.searchProducts}
                className="pl-10"
                value={filters.search}
                onChange={(e) => onFiltersChange({ search: e.target.value })}
              />
            </div>
          </div>
          <Select
            value={filters.categoryId || "all"}
            onValueChange={(value) =>
              onFiltersChange({ categoryId: value === "all" ? "" : value })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={ptBR.products.category} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{ptBR.filters.allCategories}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split("-");
              onFiltersChange({ sortBy, sortOrder });
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">{ptBR.filters.newestFirst}</SelectItem>
              <SelectItem value="createdAt-asc">{ptBR.filters.oldestFirst}</SelectItem>
              <SelectItem value="price-asc">{ptBR.filters.priceLowToHigh}</SelectItem>
              <SelectItem value="price-desc">{ptBR.filters.priceHighToLow}</SelectItem>
              <SelectItem value="views-desc">{ptBR.filters.mostPopular}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="md:hidden flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={ptBR.filters.searchPlaceholder}
            className="pl-10"
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <SheetHeader>
              <SheetTitle>{ptBR.filters.filters}</SheetTitle>
              <SheetDescription>
                {ptBR.filters.refineSearch}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <FilterContentInner
                localFilters={localFilters}
                setLocalFilters={setLocalFilters}
                categories={categories}
                handleResetFilters={handleResetFilters}
                handleApplyFilters={handleApplyFilters}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
