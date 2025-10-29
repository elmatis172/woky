import { db } from "@/lib/db";
import Link from "next/link";
import { Package } from "lucide-react";
import { OrderActions } from "@/components/admin/order-actions";

// Función helper para formatear precios de forma segura
function formatPrice(amount: number): string {
  try {
    return new Intl.NumberFormat('es-AR').format(amount);
  } catch {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
}

export default async function OrdersAdminPage() {
  let orders;
  try {
    orders = await db.order.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    orders = [];
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    PAID: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    FAILED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    REFUNDED: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };

  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    PAID: "Pagada",
    FAILED: "Fallida",
    REFUNDED: "Reembolsada",
    CANCELLED: "Cancelada",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Órdenes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona todas las órdenes de tu tienda
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Package className="h-5 w-5" />
          <span>Total: {orders.length} órdenes</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {orders.map((order: any) => {
                return (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        #{order.id.slice(0, 8)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.user?.name || "Usuario eliminado"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {order.user?.email || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                      ${formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[order.status]
                        }`}
                      >
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <OrderActions orderId={order.id} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
