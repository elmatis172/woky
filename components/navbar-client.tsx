"use client";

import Link from "next/link";
import { ShoppingCart, Menu, Search, Moon, Sun, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface NavbarClientProps {
  session: any;
}

export function NavbarClient({ session }: NavbarClientProps) {
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/productos?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <form onSubmit={handleSearch} className="hidden md:block">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar productos..."
            className="w-[200px] pl-9 lg:w-[300px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </form>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      <Button variant="ghost" size="icon" asChild>
        <Link href={session ? "/perfil" : "/sign-in"}>
          <User className="h-5 w-5" />
          <span className="sr-only">Cuenta</span>
        </Link>
      </Button>

      <Button variant="ghost" size="icon" asChild>
        <Link href="/carrito">
          <ShoppingCart className="h-5 w-5" />
          <span className="sr-only">Carrito</span>
        </Link>
      </Button>

      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Menu</span>
      </Button>
    </div>
  );
}
