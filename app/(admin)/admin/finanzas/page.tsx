import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DollarSign, TrendingUp, ShoppingCart, CreditCard } from "lucide-react";

// Función helper para formatear precios
function formatPrice(amount: number): string {
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function parseShippingAddress(data: any): { state?: string; city?: string } {
  if (!data) return {};
  
  try {
    if (typeof data === 'string') {
      const parsed = JSON.parse(data);
      return { state: parsed.state, city: parsed.city };
    }
    return { state: data.state, city: data.city };
  } catch {
    return {};
  }
}

export default async function FinanzasPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  // Obtener todas las órdenes con información financiera
  const orders = await db.order.findMany({
    select: {
      id: true,
      status: true,
      currency: true,
      subtotal: true,
      shipping: true,
      discount: true,
      totalAmount: true,
      createdAt: true,
      email: true,
      mpPaymentId: true,
      shippingAddress: true,
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  type OrderData = typeof orders[0];

  // Calcular estadísticas financieras
  const totalIngresos = orders
    .filter((order: OrderData) => order.status === 'PAID')
    .reduce((sum: number, order: OrderData) => sum + order.totalAmount, 0);

  const ingresosDelMes = orders
    .filter((order: OrderData) => {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      return order.status === 'PAID' && 
             orderDate.getMonth() === now.getMonth() && 
             orderDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum: number, order: OrderData) => sum + order.totalAmount, 0);

  const ordenesPagadas = orders.filter((order: OrderData) => order.status === 'PAID').length;
  const ordenesPendientes = orders.filter((order: OrderData) => order.status === 'PENDING').length;


  // Calcular márgenes de ganancia
  const productsWithCosts = await db.product.findMany({
    where: {
      cost: { not: null },
    },
    select: {
      id: true,
      name: true,
      price: true,
      cost: true,
      additionalCosts: true,
      stock: true,
    },
  });

  const productMargins = productsWithCosts.map((p) => {
    const totalCost = (p.cost || 0) + (p.additionalCosts || 0);
    const profit = p.price - totalCost;
    const margin = p.price > 0 ? (profit / p.price) * 100 : 0;
    return { ...p, totalCost, profit, margin };
  });

  const avgMargin = productMargins.length > 0
    ? productMargins.reduce((sum, p) => sum + p.margin, 0) / productMargins.length
    : 0;

  const totalPotentialProfit = productMargins.reduce(
    (sum, p) => sum + (p.profit * (p.stock || 0)),
    0
  );

  const _productsWithoutCost = await db.product.count({ where: { cost: null } });

  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    PAID: "Pagada",
    FAILED: "Fallida",
    REFUNDED: "Reembolsada",
    CANCELLED: "Cancelada",
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PAID: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
    REFUNDED: "bg-purple-100 text-purple-800",
    CANCELLED: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Panel Financiero
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Gestión de ingresos y análisis de pedidos
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Ingresos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Ingresos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatPrice(totalIngresos)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            De {ordenesPagadas} órdenes pagadas
          </p>
        </div>

        {/* Ingresos del Mes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Este Mes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatPrice(ingresosDelMes)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Mes actual
          </p>
        </div>

        {/* Ingreso Pendiente */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pendiente de Pago</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatPrice(ingresoPendiente)}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            {ordenesPendientes} órdenes pendientes
          </p>
        </div>

        {/* Promedio por Orden */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Promedio por Orden</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {formatPrice(ordenesPagadas > 0 ? totalIngresos / ordenesPagadas : 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Ticket promedio
          </p>
        </div>
      </div>

      {/* Tabla de Órdenes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Historial de Pedidos
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Provincia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Localidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Medio de Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Subtotal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Envío
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Descuento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  MP ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No hay órdenes registradas
                  </td>
                </tr>
              ) : (
                orders.map((order: OrderData) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.id.slice(0, 8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {order.user?.name || "Cliente"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {parseShippingAddress(order.shippingAddress).state || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {parseShippingAddress(order.shippingAddress).city || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <span className="font-medium">Mercado Pago</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatPrice(order.subtotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {order.shipping > 0 ? formatPrice(order.shipping) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">
                      {order.discount > 0 ? `-${formatPrice(order.discount)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatPrice(order.totalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-mono text-gray-500 dark:text-gray-400">
                        {order.mpPaymentId || '-'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>


      {/* Sección de Márgenes de Ganancia */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">📊 Análisis de Rentabilidad</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Margen Promedio */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Margen Promedio</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300 mt-2">
                  {avgMargin.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
              En {productMargins.length} productos con costos
            </p>
          </div>

          {/* Ganancia Potencial */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Ganancia Potencial</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-2">
                  {formatPrice(totalPotentialProfit / 100)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              Si se vende todo el stock actual
            </p>
          </div>

          {/* Productos con Mejor Margen */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Mejor Margen</p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300 mt-2">
                  {productMargins.length > 0 ? Math.max(...productMargins.map(p => p.margin)).toFixed(1) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
              Producto más rentable
            </p>
          </div>

          {/* Productos sin Costo */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Sin Costos</p>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300 mt-2">
                  {await db.product.count({ where: { cost: null } })}
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
              Productos sin costo configurado
            </p>
          </div>
        </div>
      </div>

      {/* Tabla de Productos con Márgenes */}
      {productMargins.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Top 10 Productos por Margen</h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Producto</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Precio</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Costo</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ganancia</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Margen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {productMargins
                  .sort((a, b) => b.margin - a.margin)
                  .slice(0, 10)
                  .map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-4 py-3 text-sm">{product.name}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{formatPrice(product.price / 100)}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">{formatPrice(product.totalCost / 100)}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-green-600 dark:text-green-400">{formatPrice(product.profit / 100)}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          product.margin > 50 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          product.margin > 30 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {product.margin.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


        </div>
      </div>
    </div>
  );
}


