"use client";

import { Eye } from "lucide-react";
import Link from "next/link";

interface OrderActionsProps {
  orderId: string;
}

export function OrderActions({ orderId }: OrderActionsProps) {
  return (
    <Link
      href={`/admin/ordenes/${orderId}`}
      className="inline-flex items-center p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
      title="Ver detalle de la orden"
    >
      <Eye className="h-4 w-4" />
    </Link>
  );
}
