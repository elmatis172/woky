"use client";

import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CategoryActionsProps {
  categoryId: string;
  categoryName: string;
  productCount: number;
}

export function CategoryActions({ categoryId, categoryName, productCount }: CategoryActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (productCount > 0) {
      alert(`No podés eliminar la categoría "${categoryName}" porque tiene ${productCount} producto(s) asociado(s). Primero eliminá o reasignalo(s) productos.`);
      return;
    }

    if (!confirm(`¿Estás seguro de que querés eliminar la categoría "${categoryName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar la categoría");
      }

      alert("Categoría eliminada correctamente");
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Hubo un error al eliminar la categoría");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Link
        href={`/admin/categorias/${categoryId}/editar`}
        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        title="Editar categoría"
      >
        <Edit className="h-4 w-4" />
      </Link>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Eliminar categoría"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
