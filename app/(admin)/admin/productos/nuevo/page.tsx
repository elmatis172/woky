import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function NewProductPage() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Nuevo Producto
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Crea un nuevo producto para tu tienda
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-600 dark:text-gray-400">
          Formulario de creación de producto en desarrollo...
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Por ahora, podés crear productos directamente en la base de datos o usar el seed.
        </p>
      </div>
    </div>
  );
}
