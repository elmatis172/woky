import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CategoryForm } from "@/components/admin/category-form";

export default async function NewCategoryPage() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const handleSubmit = async (data: any) => {
    "use server";
    
    await db.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Nueva Categoría
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Crea una nueva categoría para organizar tus productos
        </p>
      </div>

      <CategoryForm onSubmit={handleSubmit} />
    </div>
  );
}
