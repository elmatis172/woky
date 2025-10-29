import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { WokyLogo } from "./woky-logo";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">
              <WokyLogo /> <span>Kids</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              La mejor moda infantil para tus hijos. Ropa cómoda y de calidad.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Categorías</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/productos?cat=ropa-nino"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Ropa de Niño
                </Link>
              </li>
              <li>
                <Link
                  href="/productos?cat=ropa-nina"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Ropa de Niña
                </Link>
              </li>
              <li>
                <Link
                  href="/productos?cat=bebes"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Bebés
                </Link>
              </li>
              <li>
                <Link
                  href="/productos?cat=accesorios"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Accesorios
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Ayuda</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/contacto"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Contacto
                </Link>
              </li>
              <li>
                <Link
                  href="/envios"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Envíos
                </Link>
              </li>
              <li>
                <Link
                  href="/devoluciones"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Preguntas Frecuentes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Síguenos</h3>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} <WokyLogo className="text-sm" /> Store. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
