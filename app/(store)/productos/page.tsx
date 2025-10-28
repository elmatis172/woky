import { db } from "@/lib/db";
import { ProductGrid } from "@/components/product-grid";
import { ProductFilters } from "@/components/product-filters";

export const metadata = {
  title: "Productos",
  description: "Explora nuestro catálogo completo de productos",
};

interface ProductsPageProps {
  searchParams: {
    q?: string;
    cat?: string;
    min?: string;
    max?: string;
    sort?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { q, cat, min, max, sort = "newest" } = searchParams;

  // Construir filtros
  const where: any = {
    status: "PUBLISHED",
  };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (cat) {
    where.categoryId = cat;
  }

  if (min || max) {
    where.price = {};
    if (min) where.price.gte = parseInt(min) * 100; // Convertir a centavos
    if (max) where.price.lte = parseInt(max) * 100;
  }

  // Determinar orden
  let orderBy: any = { createdAt: "desc" };
  switch (sort) {
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "name":
      orderBy = { name: "asc" };
      break;
  }

  // Obtener productos
  const products = await db.product.findMany({
    where,
    orderBy,
    include: {
      category: true,
    },
  });

  // Obtener categorías para el filtro
  const categories = await db.category.findMany({
    where: { parentId: null },
  });

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-4xl font-bold">
        {q ? `Resultados para "${q}"` : "Todos los productos"}
      </h1>

      <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
        <aside>
          <ProductFilters categories={categories} />
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {products.length} productos encontrados
            </p>
          </div>

          <ProductGrid products={products} />

          {products.length === 0 && (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="text-center">
                <p className="text-xl font-semibold">
                  No se encontraron productos
                </p>
                <p className="mt-2 text-muted-foreground">
                  Intenta ajustar tus filtros de búsqueda
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
