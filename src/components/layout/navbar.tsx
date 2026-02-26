"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Moon,
  Sun,
  Menu,
  Package,
  MessageSquare,
  LogOut,
  User,
  Shield,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ptBR from "@/lib/translations/pt-BR";
import { useCartStore } from "@/lib/store/cart";

interface NavbarProps {
  onAuthClick?: (tab?: "login" | "register") => void;
}

export function Navbar({ onAuthClick }: NavbarProps = {}) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const { items, setItems } = useCartStore();

  const isAdmin = session?.user?.role === "ADMIN";
  const isSeller = session?.user?.role === "SELLER" || isAdmin;

  // Fetch cart items on mount
  useEffect(() => {
    if (session?.user) {
      fetch("/api/cart")
        .then((res) => res.json())
        .then((data) => setItems(data))
        .catch(() => {});
    }
  }, [session, setItems]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Package className="h-6 w-6" />
          <span className="hidden sm:inline">{ptBR.appName}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {ptBR.nav.products}
          </Link>
          {session && (
            <>
              <Link
                href="/cart"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 relative"
              >
                <ShoppingCart className="h-4 w-4" />
                {ptBR.nav.cart}
                {items.length > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-3 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {items.length}
                  </Badge>
                )}
              </Link>
              <Link
                href="/messages"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <MessageSquare className="h-4 w-4" />
                {ptBR.nav.messages}
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <Shield className="h-4 w-4" />
                  {ptBR.nav.admin}
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Alternar tema</span>
          </Button>

          {/* Cart Button (Mobile) */}
          {session && (
            <Link href="/cart" className="md:hidden relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                {items.length > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {items.length}
                  </Badge>
                )}
              </Button>
            </Link>
          )}

          {session ? (
            <>
              {/* Add Product Button (Seller only) */}
              {isSeller && (
                <Button asChild size="sm" className="hidden sm:flex">
                  <Link href="/products/new">
                    <Plus className="h-4 w-4 mr-1" />
                    {ptBR.nav.addProduct}
                  </Link>
                </Button>
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.avatar || ""} alt={session.user?.name || ""} />
                      <AvatarFallback>
                        {session.user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email}
                      </p>
                      <Badge variant="outline" className="w-fit mt-1 text-xs">
                        {session.user?.role === "ADMIN" ? ptBR.roles.admin : 
                         session.user?.role === "SELLER" ? ptBR.roles.seller : ptBR.roles.buyer}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      {ptBR.nav.profile}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/cart">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {ptBR.nav.cart}
                      {items.length > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {items.length}
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-products">
                      <Package className="mr-2 h-4 w-4" />
                      {ptBR.nav.myProducts}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messages">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {ptBR.nav.messages}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {ptBR.nav.signOut}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => onAuthClick?.("login")}>
                {ptBR.nav.signIn}
              </Button>
              <Button className="hidden sm:flex" onClick={() => onAuthClick?.("register")}>
                {ptBR.nav.signUp}
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-lg font-medium"
                >
                  <Package className="h-5 w-5" />
                  {ptBR.nav.products}
                </Link>
                {session ? (
                  <>
                    <Link
                      href="/cart"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 text-lg font-medium"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {ptBR.nav.cart}
                      {items.length > 0 && (
                        <Badge variant="destructive">{items.length}</Badge>
                      )}
                    </Link>
                    <Link
                      href="/messages"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 text-lg font-medium"
                    >
                      <MessageSquare className="h-5 w-5" />
                      {ptBR.nav.messages}
                    </Link>
                    {isSeller && (
                      <Link
                        href="/products/new"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 text-lg font-medium"
                      >
                        <Plus className="h-5 w-5" />
                        {ptBR.nav.addProduct}
                      </Link>
                    )}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 text-lg font-medium"
                      >
                        <Shield className="h-5 w-5" />
                        {ptBR.nav.admin}
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 text-lg font-medium"
                    >
                      <User className="h-5 w-5" />
                      {ptBR.nav.profile}
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                      className="mt-4"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {ptBR.nav.signOut}
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 mt-4">
                    <Button variant="outline" onClick={() => { setIsOpen(false); onAuthClick?.("login"); }}>
                      {ptBR.nav.signIn}
                    </Button>
                    <Button onClick={() => { setIsOpen(false); onAuthClick?.("register"); }}>
                      {ptBR.nav.signUp}
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
