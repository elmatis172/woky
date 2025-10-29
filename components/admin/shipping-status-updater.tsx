"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck } from "lucide-react";

interface ShippingStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
}

const shippingStatuses = [
  { value: "PENDING", label: "Pendiente", color: "bg-gray-100 text-gray-800" },
  { value: "PROCESSING", label: "Procesando", color: "bg-blue-100 text-blue-800" },
  { value: "SHIPPED", label: "Despachado", color: "bg-purple-100 text-purple-800" },
  { value: "DELIVERED", label: "Entregado", color: "bg-green-100 text-green-800" },
  { value: "CANCELLED", label: "Cancelado", color: "bg-red-100 text-red-800" },
];

export function ShippingStatusUpdater({
  orderId,
  currentStatus,
}: ShippingStatusUpdaterProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/shipping`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shippingStatus: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar el estado de envío");
      }

      setStatus(newStatus);
      router.refresh();
    } catch (error) {
      console.error("Error al actualizar estado de envío:", error);
      alert("Error al actualizar el estado de envío. Por favor intentá de nuevo.");
    } finally {
      setIsUpdating(false);
    }
  };

  const currentStatusData = shippingStatuses.find((s) => s.value === status);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Truck className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Estado del Envío
        </h3>
      </div>
      <div className="space-y-2">
        {shippingStatuses.map((statusOption) => (
          <button
            key={statusOption.value}
            onClick={() => handleStatusChange(statusOption.value)}
            disabled={isUpdating}
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              status === statusOption.value
                ? `${statusOption.color} ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800`
                : "bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {statusOption.label}
            {status === statusOption.value && " ✓"}
          </button>
        ))}
      </div>
    </div>
  );
}
