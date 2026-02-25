"use client";


import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthForms } from "@/components/auth/auth-forms";
import { ProductCard } from "@/components/products/product-card";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductForm } from "@/components/products/product-form";
import { ReportDialog } from "@/components/reports/report-dialog";
import { MessageCenter } from "@/components/messages/message-center";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { CartView } from "@/components/cart/cart-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Package,
  Plus,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  Calendar,
  Shield,
  Edit,
  Trash2,
  AlertTriangle,
  ShoppingCart,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR as dateLocale } from "date-fns/locale";
import ptBR from "@/lib/translations/pt-BR";

// Types
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string;
  views: number;
  createdAt: string | Date;
  categoryId?: string;
  seller: {
    id: string;
    name: string | null;
    avatar: string | null;
    role: string;
    bio?: string | null;
    createdAt?: string | Date;
  };
  category?: {
    id: string;
    name: string;
  } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}

type ViewType = "home" | "product" | "new-product" | "edit-product" | "messages" | "profile" | "my-products" | "admin" | "privacy" | "terms" | "anti-fraud" | "cart";

export default function HomeClient() {
  const { data: session, status } = useSession();
  const [searchParams, setSearchParams] = useState(() => 
    typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams()
  );
  
  useEffect(() => {
    setSearchParams(new URLSearchParams(window.location.search));
  }, []);
  const router = useRouter();

  // State
  const [view, setView] = useState<ViewType>("home");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMessageSheet, setShowMessageSheet] = useState(false);
  const [messageReceiverId, setMessageReceiverId] = useState<string | null>(null);
  const [prefilledMessage, setPrefilledMessage] = useState<string>("");
  const [prefilledProductId, setPrefilledProductId] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    minPrice: 0,
    maxPrice: 100000,
    categoryId: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // Check for auth param in URL
  useEffect(() => {
    const authParam = searchParams.get("auth");
    if (authParam && !session) {
      setShowAuthModal(true);
    }
  }, [searchParams, session]);

  // Fetch categories and seed on mount
  useEffect(() => {
    seedDatabase();
    fetchCategories();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [filters, pagination.page]);

  const seedDatabase = async () => {
    try {
      await fetch("/api/seed");
    } catch (e) {
      // Ignore errors
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: "12",
        search: filters.search,
        minPrice: filters.minPrice.toString(),
        maxPrice: filters.maxPrice.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.categoryId && { categoryId: filters.categoryId }),
      });

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
      setProducts(data.products);
      setPagination((prev) => ({
        ...prev,
        totalPages: data.pagination.totalPages,
        total: data.pagination.total,
      }));
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(ptBR.products.failedToCreate);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setSelectedProduct(data);
    } catch (error) {
      toast.error(ptBR.products.productNotFound);
      setView("home");
    }
  };

  const handleViewProduct = (id: string) => {
    setSelectedProductId(id);
    fetchProduct(id);
    setView("product");
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm(ptBR.productDetail.confirmDelete)) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();

      toast.success(ptBR.products.productDeleted);
      setView("home");
      fetchProducts();
    } catch {
      toast.error(ptBR.products.failedToDelete);
    }
  };

  const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleCreateProduct = async (data: any) => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error();

      toast.success(ptBR.products.productCreated);
      setView("home");
      fetchProducts();
    } catch {
      toast.error(ptBR.products.failedToCreate);
      throw new Error();
    }
  };

  const handleUpdateProduct = async (data: any) => {
    if (!selectedProductId) return;

    try {
      const response = await fetch(`/api/products/${selectedProductId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error();

      toast.success(ptBR.products.productUpdated);
      setView("home");
      fetchProducts();
    } catch {
      toast.error(ptBR.products.failedToUpdate);
      throw new Error();
    }
  };

  const isSeller = session?.user?.role === "SELLER" || session?.user?.role === "ADMIN";
  const isAdmin = session?.user?.role === "ADMIN";

  // Render different views
  const renderContent = () => {
    switch (view) {
      case "product":
        return selectedProduct ? (
          <ProductDetailView
            product={selectedProduct}
            currentUserId={session?.user?.id}
            isSeller={isSeller}
            onBack={() => setView("home")}
            onEdit={() => setView("edit-product")}
            onDelete={() => handleDeleteProduct(selectedProduct.id)}
            onMessage={() => {
              setMessageReceiverId(selectedProduct.seller.id);
              setPrefilledMessage(ptBR.productDetail.productAvailable);
              setPrefilledProductId(selectedProduct.id);
              setShowMessageSheet(true);
            }}
          />
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        );

      case "new-product":
        return isSeller ? (
          <div className="max-w-2xl mx-auto">
            <Button variant="ghost" onClick={() => setView("home")} className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              {ptBR.nav.back}
            </Button>
            <ProductForm
              categories={categories}
              onSubmit={handleCreateProduct}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">{ptBR.auth.sellerAccessRequired}</h2>
            <p className="text-muted-foreground mb-4">
              {ptBR.auth.sellerAccessDescription}
            </p>
            <Button onClick={() => setView("home")}>{ptBR.nav.goBack}</Button>
          </div>
        );

      case "edit-product":
        return selectedProduct ? (
          <div className="max-w-2xl mx-auto">
            <Button variant="ghost" onClick={() => setView("product")} className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              {ptBR.nav.back}
            </Button>
            <ProductForm
              categories={categories}
              initialData={{
                id: selectedProduct.id,
                title: selectedProduct.title,
                description: selectedProduct.description,
                price: selectedProduct.price,
                categoryId: selectedProduct.categoryId,
                images: JSON.parse(selectedProduct.images),
              }}
              onSubmit={handleUpdateProduct}
              isEditing
            />
          </div>
        ) : null;

      case "messages":
        return (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{ptBR.messages.title}</h1>
            <MessageCenter
              initialPartnerId={messageReceiverId || undefined}
              initialMessage={prefilledMessage}
              productId={prefilledProductId || undefined}
              onSendMessage={() => {
                setPrefilledMessage("");
                setPrefilledProductId(null);
              }}
            />
          </div>
        );

      case "cart":
        return <CartView />;

      case "profile":
        return <ProfileView />;

      case "my-products":
        return <MyProductsView onEdit={(id) => {
          setSelectedProductId(id);
          fetchProduct(id);
          setView("edit-product");
        }} />;

      case "admin":
        return isAdmin ? (
          <AdminDashboard />
        ) : (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">{ptBR.auth.adminAccessRequired}</h2>
            <Button onClick={() => setView("home")}>{ptBR.nav.goBack}</Button>
          </div>
        );

      case "privacy":
        return <PrivacyPolicy />;

      case "terms":
        return <TermsOfService />;

      case "anti-fraud":
        return <AntiFraudPolicy />;

      default:
        return (
          <div className="flex gap-3">
            {/* Sidebar de Filtros - sempre visível como Facebook Marketplace */}
            <aside className="w-36 sm:w-48 md:w-56 flex-shrink-0">
              <div className="sticky top-4 space-y-1">
                {/* Pesquisa - só desktop */}
                <div className="hidden md:block mb-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar..."
                      className="pl-8 h-9 text-sm"
                      value={filters.search}
                      onChange={(e) => handleFiltersChange({ search: e.target.value })}
                    />
                  </div>
                </div>

                {/* Pesquisa mobile simples */}
                <div className="md:hidden mb-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      className="pl-7 h-8 text-xs"
                      value={filters.search}
                      onChange={(e) => handleFiltersChange({ search: e.target.value })}
                    />
                  </div>
                </div>

                {/* Categorias verticais */}
                <button
                  onClick={() => handleFiltersChange({ categoryId: "" })}
                  className={`w-full text-left text-xs md:text-sm px-2 py-2 rounded-lg transition-colors font-medium ${!filters.categoryId ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  🏠 <span className="hidden sm:inline">Todas</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleFiltersChange({ categoryId: cat.id })}
                    className={`w-full text-left text-xs md:text-sm px-2 py-2 rounded-lg transition-colors ${filters.categoryId === cat.id ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted"}`}
                  >
                    <span className="line-clamp-1">{cat.name}</span>
                  </button>
                ))}

                {/* Ordenar - só desktop */}
                <div className="hidden md:block pt-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase block mb-1">Ordenar</label>
                  <Select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onValueChange={(value) => {
                      const [sortBy, sortOrder] = value.split("-");
                      handleFiltersChange({ sortBy, sortOrder });
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt-desc">Mais recentes</SelectItem>
                      <SelectItem value="price-asc">Menor preço</SelectItem>
                      <SelectItem value="price-desc">Maior preço</SelectItem>
                      <SelectItem value="views-desc">Mais vistos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </aside>

            {/* Conteúdo principal */}
            <div className="flex-1 min-w-0">


              {/* Contagem */}
              <p className="text-xs text-muted-foreground mb-3">
                {products.length} de {pagination.total} produtos
              </p>

              {/* Grid de Produtos */}
              {isLoading ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-xl font-semibold mb-2">{ptBR.products.noProducts}</h2>
                  <p className="text-muted-foreground">{ptBR.products.noProductsDescription}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {products.map((product) => (
                    <div key={product.id} onClick={() => handleViewProduct(product.id)}>
                      <ProductCard product={product} onClick={() => handleProductClick(product)} />
                    </div>
                  ))}
                </div>
              )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {ptBR.products.previous}
                </Button>
                <span className="text-sm">
                  {ptBR.products.page} {pagination.page} {ptBR.products.of} {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                >
                  {ptBR.products.next}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* View Navigation for logged in users */}
        {session && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={view === "home" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("home")}
            >
              <Package className="h-4 w-4 mr-2" />
              {ptBR.nav.products}
            </Button>
            <Button
              variant={view === "cart" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("cart")}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {ptBR.nav.cart}
            </Button>
            <Button
              variant={view === "messages" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("messages")}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {ptBR.nav.messages}
            </Button>
            {isSeller && (
              <>
                <Button
                  variant={view === "my-products" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("my-products")}
                >
                  <Package className="h-4 w-4 mr-2" />
                  {ptBR.nav.myProducts}
                </Button>
                <Button
                  variant={view === "new-product" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("new-product")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {ptBR.nav.addProduct}
                </Button>
              </>
            )}
            {isAdmin && (
              <Button
                variant={view === "admin" ? "default" : "outline"}
                size="sm"
                onClick={() => setView("admin")}
              >
                <Shield className="h-4 w-4 mr-2" />
                {ptBR.nav.admin}
              </Button>
            )}
          </div>
        )}

        {renderContent()}
      </main>

      <Footer />

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-[400px]">
          <AuthForms
            onSuccess={() => {
              setShowAuthModal(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Message Sheet */}
      <Sheet open={showMessageSheet} onOpenChange={setShowMessageSheet}>
        <SheetContent className="sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>{ptBR.messages.title}</SheetTitle>
            <SheetDescription>
              {ptBR.messages.sendToSeller}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <MessageCenter
              initialPartnerId={messageReceiverId || undefined}
              onSendMessage={() => setShowMessageSheet(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Product Detail View Component
function ProductDetailView({
  product,
  currentUserId,
  isSeller,
  onBack,
  onEdit,
  onDelete,
  onMessage,
}: {
  product: Product;
  currentUserId?: string;
  isSeller: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMessage: () => void;
}) {
  const { data: session } = useSession();
  const [currentImage, setCurrentImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const images = JSON.parse(product.images) as string[];
  const isOwner = currentUserId === product.seller.id;

  // Check if product is in cart
  useEffect(() => {
    if (session?.user && !isOwner) {
      fetch("/api/cart")
        .then((res) => res.json())
        .then((items) => {
          const found = items.some((item: any) => item.productId === product.id);
          setIsInCart(found);
        })
        .catch(() => {});
    }
  }, [session, product.id, isOwner]);

  const handleAddToCart = async () => {
    if (!session?.user) {
      toast.error(ptBR.productDetail.loginToAddCart);
      return;
    }

    setIsAddingToCart(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Erro ao adicionar ao carrinho");
      } else {
        toast.success(ptBR.productDetail.addedToCart);
        setIsInCart(true);
      }
    } catch {
      toast.error("Erro ao adicionar ao carrinho");
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ChevronLeft className="h-4 w-4 mr-2" />
        {ptBR.nav.backToProducts}
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-muted">
            <img
              src={images[currentImage]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    currentImage === index
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            {product.category && (
              <Badge variant="secondary" className="mb-2">
                {product.category.name}
              </Badge>
            )}
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {product.views} {ptBR.products.views}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDistanceToNow(new Date(product.createdAt), {
                  addSuffix: true,
                  locale: dateLocale,
                })}
              </div>
            </div>
          </div>

          <div className="text-4xl font-bold text-primary">
            MT {product.price.toLocaleString("pt-MZ", { minimumFractionDigits: 2 })}
          </div>

          <Separator />

          <div>
            <h2 className="font-semibold mb-2">{ptBR.productDetail.description}</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {product.description}
            </p>
          </div>

          <Separator />

          {/* Seller Info */}
          <div>
            <h2 className="font-semibold mb-4">{ptBR.productDetail.sellerInfo}</h2>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={product.seller.avatar || ""} />
                <AvatarFallback>
                  {product.seller.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{product.seller.name}</p>
                <p className="text-sm text-muted-foreground">
                  {ptBR.productDetail.memberSince}{" "}
                  {product.seller.createdAt
                    ? format(new Date(product.seller.createdAt), "MMM yyyy", { locale: dateLocale })
                    : "N/A"}
                </p>
              </div>
              <Badge variant="outline">
                {product.seller.role === "ADMIN" ? ptBR.roles.admin : 
                 product.seller.role === "SELLER" ? ptBR.roles.seller : ptBR.roles.buyer}
              </Badge>
            </div>
            {product.seller.bio && (
              <p className="text-sm text-muted-foreground mt-3">
                {product.seller.bio}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {!isOwner && (
              <>
                {/* Add to Cart Button */}
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || isInCart}
                  variant={isInCart ? "secondary" : "default"}
                  className="flex-1"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isAddingToCart ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isInCart ? (
                    ptBR.productDetail.alreadyInCart
                  ) : (
                    ptBR.productDetail.addToCart
                  )}
                </Button>
                
                {/* Send Message Button */}
                <Button
                  onClick={onMessage}
                  variant="outline"
                  className="flex-1"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {ptBR.productDetail.sendMessage}
                </Button>
                
                <ReportDialog
                  type="PRODUCT"
                  targetId={product.id}
                  targetName={product.title}
                />
              </>
            )}
            {isOwner && (
              <>
                <p className="text-sm text-muted-foreground w-full mb-2">
                  {ptBR.productDetail.ownProduct}
                </p>
                <Button onClick={onEdit} className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  {ptBR.productDetail.edit}
                </Button>
                <Button variant="destructive" onClick={onDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {ptBR.productDetail.delete}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Profile View Component
function ProfileView() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio }),
      });
      if (!response.ok) throw new Error();
      toast.success(ptBR.profile.profileUpdated);
    } catch {
      toast.error("Falha ao actualizar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{ptBR.profile.title}</h1>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={session?.user?.avatar || ""} />
            <AvatarFallback className="text-2xl">
              {session?.user?.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{session?.user?.name}</h2>
            <p className="text-muted-foreground">{session?.user?.email}</p>
            <Badge variant="outline" className="mt-1">
              {session?.user?.role === "ADMIN" ? ptBR.roles.admin : 
               session?.user?.role === "SELLER" ? ptBR.roles.seller : ptBR.roles.buyer}
            </Badge>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{ptBR.profile.displayName}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">{ptBR.profile.bio}</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={ptBR.profile.bioPlaceholder}
              rows={4}
            />
          </div>

          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {ptBR.profile.saveChanges}
          </Button>
        </div>
      </div>
    </div>
  );
}

// My Products View Component
function MyProductsView({ onEdit }: { onEdit: (id: string) => void }) {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) fetchMyProducts();
  }, [session?.user?.id]);

  const fetchMyProducts = async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch(`/api/products?sellerId=${session.user.id}&limit=50`);
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      toast.error(ptBR.products.failedToCreate);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(ptBR.productDetail.confirmDelete)) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();

      toast.success(ptBR.products.productDeleted);
      fetchMyProducts();
    } catch {
      toast.error(ptBR.products.failedToDelete);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{ptBR.products.myProducts}</h1>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">{ptBR.products.noProductsYet}</h2>
          <p className="text-muted-foreground">{ptBR.products.startSelling}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} onClick={() => handleProductClick(product)} />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="secondary" onClick={() => onEdit(product.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Privacy Policy Component
function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto prose prose-sm dark:prose-invert">
      <h1 className="text-3xl font-bold mb-6">{ptBR.policies.privacyPolicy}</h1>

      <p className="text-muted-foreground mb-8">
        {ptBR.policies.lastUpdated} {new Date().toLocaleDateString("pt-MZ")}
      </p>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">{ptBR.policies.infoWeCollect}</h2>
          <p className="text-muted-foreground">
            {ptBR.policies.infoWeCollectText}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{ptBR.policies.howWeUse}</h2>
          <p className="text-muted-foreground">
            {ptBR.policies.howWeUseText}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{ptBR.policies.antiFraudClause}</h2>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive mb-2">{ptBR.footer.warning}</h3>
                <p className="text-sm text-muted-foreground">
                  {ptBR.policies.antiFraudClauseText}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{ptBR.policies.dataSecurity}</h2>
          <p className="text-muted-foreground">
            {ptBR.policies.dataSecurityText}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{ptBR.policies.yourRights}</h2>
          <p className="text-muted-foreground">
            {ptBR.policies.yourRightsText}
          </p>
        </section>
      </div>
    </div>
  );
}

// Terms of Service Component
function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto prose prose-sm dark:prose-invert">
      <h1 className="text-3xl font-bold mb-6">{ptBR.policies.termsOfService}</h1>

      <p className="text-muted-foreground mb-8">
        {ptBR.policies.lastUpdated} {new Date().toLocaleDateString("pt-MZ")}
      </p>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">{ptBR.policies.acceptanceOfTerms}</h2>
          <p className="text-muted-foreground">
            {ptBR.policies.acceptanceOfTermsText}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{ptBR.policies.userResponsibilities}</h2>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            {ptBR.policies.userResponsibilitiesList.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{ptBR.policies.prohibitedActivities}</h2>
          <div className="bg-muted rounded-lg p-4">
            <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
              {ptBR.policies.prohibitedActivitiesList.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{ptBR.policies.consequences}</h2>
          <p className="text-muted-foreground">
            {ptBR.policies.consequencesText}
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">{ptBR.policies.adminRights}</h2>
          <p className="text-muted-foreground">
            {ptBR.policies.adminRightsText}
          </p>
        </section>
      </div>
    </div>
  );
}

// Anti-Fraud Policy Component
function AntiFraudPolicy() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{ptBR.policies.antiFraudPolicy}</h1>

      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-destructive mb-4 flex items-center gap-2">
          <AlertTriangle className="h-6 w-6" />
          {ptBR.policies.zeroTolerance}
        </h2>
        <p className="text-muted-foreground">
          {ptBR.policies.zeroToleranceText}
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">{ptBR.policies.whatConstitutesFraud}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-medium mb-2">{ptBR.policies.productMisrepresentation}</h3>
              <p className="text-sm text-muted-foreground">
                {ptBR.policies.productMisrepresentationText}
              </p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-medium mb-2">{ptBR.policies.counterfeitGoods}</h3>
              <p className="text-sm text-muted-foreground">
                {ptBR.policies.counterfeitGoodsText}
              </p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-medium mb-2">{ptBR.policies.nonDeliveryScams}</h3>
              <p className="text-sm text-muted-foreground">
                {ptBR.policies.nonDeliveryScamsText}
              </p>
            </div>
            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-medium mb-2">{ptBR.policies.phishingAttempts}</h3>
              <p className="text-sm text-muted-foreground">
                {ptBR.policies.phishingAttemptsText}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">{ptBR.policies.howToReport}</h2>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            {ptBR.policies.howToReportList.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">{ptBR.policies.consequencesHeading}</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Badge variant="outline">{ptBR.policies.firstOffense}</Badge>
              <span className="text-muted-foreground">{ptBR.policies.firstOffenseText}</span>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Badge variant="destructive">{ptBR.policies.seriousCases}</Badge>
              <span className="text-muted-foreground">{ptBR.policies.seriousCasesText}</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">{ptBR.policies.tipsForSafeTrading}</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            {ptBR.policies.tipsForSafeTradingList.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
