import { db } from "@/lib/db";
import { 
  ShoppingBag, 
  Package, 
  Users, 
  DollarSign,
  TrendingUp,
  TrendingDown
} from "lucide-react";

export default async function AdminDashboard() {
  // Obtener estadísticas SOLO de productos y usuarios (sin órdenes)
  const [
    totalProducts,
    totalUsers,
  ] = await Promise.all([
    db.product.count(),
    db.user.count(),
  ]);

  // Estadísticas hardcodeadas temporalmente para evitar errores
  const totalOrders = 0;
  const pendingOrders = 0;
  const recentOrders: any[] = [];
  const totalRevenue = 0;

  const stats = [
    {
      title: "Ingresos Totales",
      value: `$${totalRevenue.toLocaleString("es-AR")}`,
      icon: DollarSign,
      trend: "+12.5%",
      trendUp: true,
      bgColor: "bg-green-500",
    },
    {
      title: "Órdenes",
      value: totalOrders,
      icon: ShoppingBag,
      trend: `${pendingOrders} pendientes`,
      trendUp: false,
      bgColor: "bg-blue-500",
    },
    {
      title: "Productos",
      value: totalProducts,
      icon: Package,
      trend: "8 activos",
      trendUp: true,
      bgColor: "bg-purple-500",
    },
    {
      title: "Usuarios",
      value: totalUsers,
      icon: Users,
      trend: "+3 este mes",
      trendUp: true,
      bgColor: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Resumen general de tu tienda
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
                <div className="flex items-center mt-2">
                  {stat.trendUp ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-gray-500 mr-1" />
                  )}
                  <span className={`text-sm ${stat.trendUp ? 'text-green-500' : 'text-gray-500'}`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Órdenes Recientes
          </h2>
        </div>
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
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No hay órdenes recientes
                  </td>
                </tr>
              ) : (
                recentOrders.map((order: any) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {order.user?.name || "Usuario eliminado"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-semibold">
                      ${order.totalAmount.toLocaleString("es-AR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === "PAID"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : order.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : order.status === "FAILED"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : order.status === "CANCELLED"
                            ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                        }`}
                      >
                        {order.status === "PAID" ? "Pagada" : 
                         order.status === "PENDING" ? "Pendiente" : 
                         order.status === "FAILED" ? "Fallida" :
                         order.status === "CANCELLED" ? "Cancelada" :
                         order.status === "REFUNDED" ? "Reembolsada" : order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("es-AR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
