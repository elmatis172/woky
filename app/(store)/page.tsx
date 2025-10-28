import { db } from "@/lib/db";
import { HeroSection } from "@/components/hero-section";
import { FeaturedProducts } from "@/components/featured-products";
import { CategoriesGrid } from "@/components/categories-grid";

export const metadata = {
  title: "Inicio",
  description: "Descubre los mejores productos al mejor precio",
};

export default async function HomePage() {
  // Obtener productos destacados
  const featuredProducts = await db.product.findMany({
    where: {
      status: "PUBLISHED",
      featured: true,
    },
    take: 8,
    orderBy: {
      createdAt: "desc",
    },
  });

  // Obtener categorías
  const categories = await db.category.findMany({
    where: {
      parentId: null, // Solo categorías principales
    },
    take: 4,
  });

  return (
    <div className="flex flex-col gap-16 pb-16">
      <HeroSection />
      
      <section className="container">
        <h2 className="mb-8 text-3xl font-bold">Categorías</h2>
        <CategoriesGrid categories={categories} />
      </section>

      <section className="container">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Productos Destacados</h2>
        </div>
        <FeaturedProducts products={featuredProducts} />
      </section>
    </div>
  );
}
