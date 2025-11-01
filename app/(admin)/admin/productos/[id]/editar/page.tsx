import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!product) {
    redirect("/admin/productos");
  }

  // Obtener todas las categorías
  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  // Parsear imágenes
  let images: string[] = [];
  try {
    images = typeof product.images === "string" 
      ? JSON.parse(product.images) 
      : Array.isArray(product.images) 
      ? product.images 
      : [];
  } catch {
    images = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Editar Producto
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Modificá la información del producto: {product.name}
        </p>
      </div>

      <ProductForm
        product={{
          id,
          name: product.name,
          slug: product.slug,
          description: product.description ?? undefined,
          price: product.price,
          compareAtPrice: product.compareAtPrice ?? undefined,
          sku: product.sku ?? undefined,
          stock: product.stock,
          status: product.status,
          featured: product.featured,
          categoryId: product.categoryId ?? undefined,
          images,
          // Dimensiones para Mercado Envíos
          weight: product.weight ?? undefined,
          width: product.width ?? undefined,
          height: product.height ?? undefined,
          length: product.length ?? undefined,
          // Costos y márgenes
          cost: product.cost ?? undefined,
          additionalCosts: product.additionalCosts ?? undefined,
        }}
        categories={categories.map((c: any) => ({ id: c.id, name: c.name }))}
          // Costos y márgenes
          cost: product.cost ?? undefined,
          additionalCosts: product.additionalCosts ?? undefined,
        isEdit={true}
      />
    </div>
  );
}
