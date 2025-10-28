import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { NavbarClient } from "./navbar-client";
import { auth } from "@/lib/auth";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingCart className="h-6 w-6" />
            <span className="text-xl font-bold">Woky Kids</span>
          </Link>

          <nav className="hidden md:flex gap-6">
            <Link
              href="/productos"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Todos
            </Link>
            <Link
              href="/productos?cat=ropa-nino"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Niños
            </Link>
            <Link
              href="/productos?cat=ropa-nina"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Niñas
            </Link>
            <Link
              href="/productos?cat=bebes"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Bebés
            </Link>
            <Link
              href="/productos?cat=accesorios"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Accesorios
            </Link>
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="text-sm font-medium transition-colors hover:text-primary text-blue-600 dark:text-blue-400 font-semibold"
              >
                🛠️ Admin
              </Link>
            )}
          </nav>
        </div>

        <NavbarClient session={session} />
      </div>
    </header>
  );
}
