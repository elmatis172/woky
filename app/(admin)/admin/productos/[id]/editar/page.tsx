import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">Información del Producto</h3>
            <dl className="mt-4 space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">Nombre:</dt>
                <dd className="font-medium">{product.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">Precio:</dt>
                <dd className="font-medium">${product.price}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">Stock:</dt>
                <dd className="font-medium">{product.stock}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">Categoría:</dt>
                <dd className="font-medium">{product.category?.name || "Sin categoría"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-gray-400">Estado:</dt>
                <dd className="font-medium">{product.status}</dd>
              </div>
            </dl>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">
              Formulario de edición en desarrollo. Por ahora, podés ver la información del producto aquí.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
