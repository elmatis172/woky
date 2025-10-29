"use client";

import { Eye, Printer, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface OrderActionsProps {
  orderId: string;
}

export function OrderActions({ orderId }: OrderActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que querés eliminar esta orden? Esta acción no se puede deshacer.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la orden");
      }

      alert("Orden eliminada correctamente");
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un error al eliminar la orden");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/ordenes/${orderId}`}
        className="inline-flex items-center p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
        title="Ver detalle de la orden"
      >
        <Eye className="h-4 w-4" />
      </Link>
      <Link
        href={`/admin/ordenes/${orderId}/print`}
        target="_blank"
        className="inline-flex items-center p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title="Imprimir orden"
      >
        <Printer className="h-4 w-4" />
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="inline-flex items-center p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Eliminar orden"
        aria-label="Eliminar orden"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
