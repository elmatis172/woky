"use client";

import { Eye, Printer } from "lucide-react";
import Link from "next/link";

interface OrderActionsProps {
  orderId: string;
}

export function OrderActions({ orderId }: OrderActionsProps) {
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
    </div>
  );
}
