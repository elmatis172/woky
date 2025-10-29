import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Package, User, CreditCard, MapPin } from "lucide-react";
// import { ShippingStatusUpdater } from "@/components/admin/shipping-status-updater"; // Deshabilitado temporalmente

// Funciones helper fuera del componente
function formatPrice(amount: number): string {
  try {
    return new Intl.NumberFormat('es-AR').format(amount);
  } catch {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
}

function formatDate(date: Date | string): string {
  try {
    const d = new Date(date);
    return d.toISOString().split('T')[0] + ' ' + d.toTimeString().split(' ')[0];
  } catch {
    return String(date);
  }
}

function parseShippingAddress(address: string | null): any {
  if (!address) return null;
  try {
    return typeof address === 'string' ? JSON.parse(address) : address;
  } catch {
    return address;
  }
}

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/sign-in");
  }

  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      email: true,
      status: true,
      currency: true,
      subtotal: true,
      shipping: true,
      discount: true,
      totalAmount: true,
      mpPaymentId: true,
      createdAt: true,
      updatedAt: true,
      shippingAddress: true,
      billingAddress: true,
      customerData: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // Parse datos de envío y facturación
  const shippingAddress = parseShippingAddress(order.shippingAddress);
  const billingAddress = parseShippingAddress(order.billingAddress);
  const customerData = parseShippingAddress(order.customerData);

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
          href="/admin/ordenes"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Orden #{order.id.slice(0, 8)}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Estado y Pago */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Estado y Pago
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estado</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.status]}`}>
                    {statusLabels[order.status]}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Moneda</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {order.currency}
                  </p>
                </div>
              </div>

              {/* Desglose de costos */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    ${formatPrice(order.subtotal)}
                  </span>
                </div>
                {order.shipping > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Envío</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      ${formatPrice(order.shipping)}
                    </span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Descuento</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      -${formatPrice(order.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-base font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>

              {order.mpPaymentId && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ID de Pago Mercado Pago</p>
                  <p className="text-sm font-mono text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded">
                    {order.mpPaymentId}
                  </p>
                </div>
              )}
              {order.mpPreferenceId && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ID de Preferencia MP</p>
                  <p className="text-sm font-mono text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded">
                    {order.mpPreferenceId}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Productos */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Productos ({order.items.length})
            </h2>
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {item.product?.name || "Producto eliminado"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Cantidad: {item.quantity} × ${formatPrice(item.unitPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${formatPrice(item.quantity * item.unitPrice)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300 dark:border-gray-600">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Información del Cliente */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Cliente
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Nombre</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.user?.name || "Usuario eliminado"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.user?.email || "N/A"}
                </p>
              </div>
              {order.user && (
                <Link
                  href={`/admin/usuarios/${order.user.id}`}
                  className="inline-block mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Ver perfil completo →
                </Link>
              )}
            </div>
          </div>

          {/* Actualizador de Estado de Envío - DESHABILITADO TEMPORALMENTE */}
          {/* <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <ShippingStatusUpdater
              orderId={order.id}
              currentStatus={order.shippingStatus || "PENDING"}
            />
          </div> */}

          {shippingAddress && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Dirección de Envío
              </h2>
              <div className="space-y-2 text-sm">
                {typeof shippingAddress === 'string' ? (
                  <p className="text-gray-900 dark:text-white whitespace-pre-line">
                    {shippingAddress}
                  </p>
                ) : (
                  <>
                    {shippingAddress.name && (
                      <p className="font-medium text-gray-900 dark:text-white">
                        {shippingAddress.name}
                      </p>
                    )}
                    {shippingAddress.phone && (
                      <p className="text-gray-600 dark:text-gray-400">
                        Tel: {shippingAddress.phone}
                      </p>
                    )}
                    {shippingAddress.street && (
                      <p className="text-gray-900 dark:text-white mt-2">
                        {shippingAddress.street}
                      </p>
                    )}
                    {shippingAddress.number && (
                      <p className="text-gray-900 dark:text-white">
                        Nº {shippingAddress.number}
                      </p>
                    )}
                    {shippingAddress.apartment && (
                      <p className="text-gray-600 dark:text-gray-400">
                        {shippingAddress.apartment}
                      </p>
                    )}
                    {(shippingAddress.city || shippingAddress.state || shippingAddress.zipCode) && (
                      <p className="text-gray-900 dark:text-white">
                        {[shippingAddress.city, shippingAddress.state, shippingAddress.zipCode]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                    {shippingAddress.country && (
                      <p className="text-gray-900 dark:text-white">
                        {shippingAddress.country}
                      </p>
                    )}
                    {shippingAddress.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Notas adicionales:
                        </p>
                        <p className="text-gray-900 dark:text-white">
                          {shippingAddress.notes}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {billingAddress && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Dirección de Facturación
              </h2>
              <div className="space-y-2 text-sm">
                {typeof billingAddress === 'string' ? (
                  <p className="text-gray-900 dark:text-white whitespace-pre-line">
                    {billingAddress}
                  </p>
                ) : (
                  <>
                    {billingAddress.name && (
                      <p className="font-medium text-gray-900 dark:text-white">
                        {billingAddress.name}
                      </p>
                    )}
                    {billingAddress.taxId && (
                      <p className="text-gray-600 dark:text-gray-400">
                        CUIT/DNI: {billingAddress.taxId}
                      </p>
                    )}
                    {billingAddress.street && (
                      <p className="text-gray-900 dark:text-white mt-2">
                        {billingAddress.street}
                        {billingAddress.number && ` ${billingAddress.number}`}
                      </p>
                    )}
                    {(billingAddress.city || billingAddress.state || billingAddress.zipCode) && (
                      <p className="text-gray-900 dark:text-white">
                        {[billingAddress.city, billingAddress.state, billingAddress.zipCode]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}
                    {billingAddress.country && (
                      <p className="text-gray-900 dark:text-white">
                        {billingAddress.country}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {customerData && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Datos Adicionales del Cliente
              </h2>
              <div className="space-y-2 text-sm">
                {typeof customerData === 'string' ? (
                  <p className="text-gray-900 dark:text-white whitespace-pre-line">
                    {customerData}
                  </p>
                ) : (
                  <>
                    {customerData.documentType && customerData.documentNumber && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Documento</p>
                        <p className="text-gray-900 dark:text-white">
                          {customerData.documentType}: {customerData.documentNumber}
                        </p>
                      </div>
                    )}
                    {customerData.phone && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Teléfono</p>
                        <p className="text-gray-900 dark:text-white">
                          {customerData.phone}
                        </p>
                      </div>
                    )}
                    {customerData.alternativePhone && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Teléfono alternativo</p>
                        <p className="text-gray-900 dark:text-white">
                          {customerData.alternativePhone}
                        </p>
                      </div>
                    )}
                    {customerData.birthDate && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Fecha de nacimiento</p>
                        <p className="text-gray-900 dark:text-white">
                          {customerData.birthDate}
                        </p>
                      </div>
                    )}
                    {customerData.preferences && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Preferencias:
                        </p>
                        <p className="text-gray-900 dark:text-white">
                          {customerData.preferences}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
