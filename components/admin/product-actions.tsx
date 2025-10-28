"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";

interface ProductActionsProps {
  productId: string;
  productName: string;
}

export function ProductActions({ productId, productName }: ProductActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro que querés eliminar "${productName}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar el producto");
      }

      // Refrescar la página para mostrar los cambios
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al eliminar el producto");
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/productos/${productId}/editar`}
        className="inline-flex items-center p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        title="Editar producto"
      >
        <Edit className="h-4 w-4" />
      </Link>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="inline-flex items-center p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Eliminar producto"
      >
        {isDeleting ? (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
