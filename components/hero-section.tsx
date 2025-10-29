"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/50 py-20 md:py-32">
      <div className="container">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
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
              {/* @ts-expect-error - Button size prop type issue */}
              <Button asChild size="lg">
                <Link href="/productos">
                  Ver productos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              {/* @ts-expect-error - Button size prop type issue */}
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
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl">
              <Image
                src="/kids-hero.png"
                alt="Niños con ropa Woky Kids"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
