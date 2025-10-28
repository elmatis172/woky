import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  // Obtener todas las categorías
  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const handleSubmit = async (data: any) => {
    "use server";
    
    await db.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: Number(data.price),
        compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : null,
        sku: data.sku,
        stock: Number(data.stock),
        images: JSON.stringify(data.images || []),
        categoryId: data.categoryId || null,
        status: data.status || "DRAFT",
        featured: data.featured || false,
        tags: JSON.stringify(data.tags || []),
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Nuevo Producto
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Completa el formulario para agregar un nuevo producto a la tienda
        </p>
      </div>

      <ProductForm
        categories={categories.map((c: any) => ({ id: c.id, name: c.name }))}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
