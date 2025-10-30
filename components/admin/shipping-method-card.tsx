"use client";

import Link from "next/link";
import { Edit, Trash2, Package, Truck, Store, Gift } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type ShippingMethodType = "STANDARD" | "EXPRESS" | "PICKUP" | "FREE";

type ShippingMethod = {
  id: string;
  name: string;
  description: string | null;
  type: ShippingMethodType;
  cost: number;
  estimatedDays: string | null;
  isActive: boolean;
  provinces: string | null;
  minAmount: number | null;
  maxAmount: number | null;
};

const typeIcons: Record<ShippingMethodType, any> = {
  STANDARD: Truck,
  EXPRESS: Package,
  PICKUP: Store,
  FREE: Gift,
};

const typeLabels: Record<ShippingMethodType, string> = {
  STANDARD: "Envío Estándar",
  EXPRESS: "Envío Express",
  PICKUP: "Retiro en Sucursal",
  FREE: "Envío Gratis",
};

export function ShippingMethodCard({ method }: { method: ShippingMethod }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const Icon = typeIcons[method.type];

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que querés eliminar el método "${method.name}"?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/shipping-methods/${method.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar el método de envío");
      }

      alert("Método de envío eliminado correctamente");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al eliminar el método de envío");
      setIsDeleting(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border p-6 ${!method.isActive ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${method.isActive ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-700"}`}>
            <Icon className={`h-6 w-6 ${method.isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{method.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{typeLabels[method.type]}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href={`/admin/envios/${method.id}/editar`}
            className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {method.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{method.description}</p>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Costo:</span>
          <span className="font-semibold">
            {method.cost === 0 ? "Gratis" : `$${(method.cost / 100).toLocaleString('es-AR')}`}
          </span>
        </div>
        {method.estimatedDays && (
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Tiempo estimado:</span>
            <span className="font-semibold">{method.estimatedDays}</span>
          </div>
        )}
        {method.minAmount && (
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Mínimo:</span>
            <span className="font-semibold">${(method.minAmount / 100).toLocaleString('es-AR')}</span>
          </div>
        )}
        {method.maxAmount && (
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-gray-400">Máximo:</span>
            <span className="font-semibold">${(method.maxAmount / 100).toLocaleString('es-AR')}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-gray-500 dark:text-gray-400">Estado:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            method.isActive 
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
          }`}>
            {method.isActive ? "Activo" : "Inactivo"}
          </span>
        </div>
      </div>
    </div>
  );
}
