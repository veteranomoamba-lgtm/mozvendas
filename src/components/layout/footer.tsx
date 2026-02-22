"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import ptBR from "@/lib/translations/pt-BR";

export function Footer() {
  const { theme, setTheme } = useTheme();

  return (
    <footer className="mt-auto border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <Package className="h-5 w-5" />
              {ptBR.appName}
            </Link>
            <p className="text-sm text-muted-foreground">
              {ptBR.appTagline}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">{ptBR.footer.quickLinks}</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {ptBR.footer.browseProducts}
              </Link>
              <Link
                href="/?auth=register"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {ptBR.footer.becomeSeller}
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold">{ptBR.footer.legal}</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {ptBR.footer.privacyPolicy}
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {ptBR.footer.termsOfService}
              </Link>
              <Link
                href="/anti-fraud"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {ptBR.footer.antiFraudPolicy}
              </Link>
            </nav>
          </div>

          {/* Theme & Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">{ptBR.footer.preferences}</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{ptBR.footer.theme}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4 mr-1" />
                    {ptBR.footer.light}
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-1" />
                    {ptBR.footer.dark}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} {ptBR.appName}. {ptBR.footer.allRightsReserved}
          </p>
          <p className="mt-2">
            <span className="text-destructive font-medium">
              {ptBR.footer.warning}{" "}
            </span>
            {ptBR.footer.fraudWarning}
          </p>
        </div>
      </div>
    </footer>
  );
}
