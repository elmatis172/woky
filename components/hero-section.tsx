"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/50 py-20 md:py-32">
      <div className="container">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col justify-center"
          >
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Moda Infantil{" "}
              <span className="bg-gradient-to-r from-primary to-pink-600 bg-clip-text text-transparent">
                con Estilo
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              La mejor ropa para niños y niñas. Calidad, comodidad y diseños únicos. Envíos a todo el país con pago seguro por Mercado Pago.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/productos">
                  Ver productos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/productos?featured=true">
                  Destacados
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 to-blue-600/20">
              {/* Placeholder para imagen hero */}
              <div className="flex h-full items-center justify-center">
                <p className="text-6xl">🛍️</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
