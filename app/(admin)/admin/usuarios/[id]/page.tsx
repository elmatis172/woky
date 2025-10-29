import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Mail, Shield, ShieldCheck, Calendar, ShoppingBag } from "lucide-react";

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      blocked: true,
      createdAt: true,
      updatedAt: true,
      orders: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
        select: {
          id: true,
          email: true,
          status: true,
          totalAmount: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          orders: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Calcular total gastado
  const totalSpent = user.orders.reduce((sum: number, order: any) => {
    if (order.status === "PAID") {
      return sum + order.totalAmount;
    }
    return sum;
  }, 0);

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
      <div className="flex items-center gap-4">
        <Link
          href="/admin/usuarios"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {user.name || "Sin nombre"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {user.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Usuario */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Información Personal</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nombre</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user.name || "Sin nombre"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white break-all">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user.role === "ADMIN" ? (
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                ) : (
                  <Shield className="h-4 w-4 text-gray-500" />
                )}
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rol</p>
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === "ADMIN"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Registro</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(user.createdAt).toLocaleDateString("es-AR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Estadísticas</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total de Órdenes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {user._count.orders}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Gastado</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  ${totalSpent.toLocaleString("es-AR")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Historial de Órdenes */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Historial de Órdenes ({user._count.orders})
            </h2>
            
            {user.orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  Este usuario no ha realizado ninguna compra todavía
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {user.orders.map((order: any) => (
                  <Link
                    key={order.id}
                    href={`/admin/ordenes/${order.id}`}
                    className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Orden #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString("es-AR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ${order.totalAmount.toLocaleString("es-AR")}
                        </p>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
                
                {user._count.orders > 10 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center pt-2">
                    Mostrando las últimas 10 órdenes de {user._count.orders}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
