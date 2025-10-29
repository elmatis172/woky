import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Plus, FolderTree } from "lucide-react";
import { CategoryActions } from "@/components/admin/category-actions";

export default async function CategoriesAdminPage() {
  const categories = await db.category.findMany({
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Categorías
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organiza tus productos por categorías
          </p>
        </div>
        <Link
          href="/admin/categorias/nueva"
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Nueva Categoría</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
          >
            {category.image ? (
              <div className="relative h-40 w-full">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-40 w-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <FolderTree className="h-16 w-16 text-white opacity-50" />
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {category.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {category.description || "Sin descripción"}
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {category._count.products} productos
                </span>
                <CategoryActions
                  categoryId={category.id}
                  categoryName={category.name}
                  productCount={category._count.products}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
