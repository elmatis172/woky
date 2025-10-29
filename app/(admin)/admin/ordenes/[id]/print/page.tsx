import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PrintActions } from "@/components/admin/print-actions";

// Funciones helper
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
    return d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(date);
  }
}

function parseJSON(data: string | null): any {
  if (!data) return null;
  try {
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch {
    return data;
  }
}

interface PrintOrderPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PrintOrderPage({ params }: PrintOrderPageProps) {
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
      mpPreferenceId: true,
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
              price: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const shippingAddress = parseJSON(order.shippingAddress);
  const customerData = parseJSON(order.customerData);

  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    PAID: "Pagada",
    FAILED: "Fallida",
    REFUNDED: "Reembolsada",
    CANCELLED: "Cancelada",
  };

  // const shippingStatusLabels: Record<string, string> = {
  //   PENDING: "Pendiente",
  //   PROCESSING: "Procesando",
  //   SHIPPED: "Despachado",
  //   DELIVERED: "Entregado",
  //   CANCELLED: "Cancelado",
  // };

  return (
    <div className="min-h-screen bg-white p-8 print:p-0">
        {/* Botón Imprimir - Solo visible en pantalla */}
        <PrintActions />

        {/* Contenido imprimible */}
        <div className="max-w-4xl mx-auto bg-white">
          {/* Header */}
          <div className="border-b-4 border-gray-800 pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">WOKY KIDS</h1>
                <p className="text-gray-600">Orden de Preparación</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Orden #</p>
                <p className="text-2xl font-bold text-gray-900">{order.id.slice(0, 8)}</p>
                <p className="text-sm text-gray-600 mt-2">{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Estados */}
          <div className="grid grid-cols-1 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 font-medium">Estado de Pago</p>
              <p className="text-lg font-bold text-gray-900">{statusLabels[order.status]}</p>
            </div>
            {/* Estado de envío deshabilitado temporalmente */}
            {/* <div>
              <p className="text-sm text-gray-600 font-medium">Estado de Envío</p>
              <p className="text-lg font-bold text-gray-900">{shippingStatusLabels[order.shippingStatus || "PENDING"]}</p>
            </div> */}
          </div>

          {/* Información del Cliente */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-gray-300 pb-2">
              📋 DATOS DEL CLIENTE
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="font-medium text-gray-900">{order.user?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900">{order.email}</p>
              </div>
              {customerData?.phone && (
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-medium text-gray-900">{customerData.phone}</p>
                </div>
              )}
              {customerData?.documentNumber && (
                <div>
                  <p className="text-sm text-gray-600">Documento</p>
                  <p className="font-medium text-gray-900">
                    {customerData.documentType || "DNI"}: {customerData.documentNumber}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dirección de Envío */}
          <div className="mb-6 p-4 border-2 border-gray-800 rounded-lg bg-yellow-50">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              📦 DIRECCIÓN DE ENVÍO
            </h2>
            {shippingAddress ? (
              typeof shippingAddress === 'string' ? (
                <p className="text-gray-900 whitespace-pre-line font-medium">{shippingAddress}</p>
              ) : (
                <div className="space-y-2">
                  {shippingAddress.name && (
                    <p className="font-bold text-gray-900 text-lg">{shippingAddress.name}</p>
                  )}
                  {shippingAddress.phone && (
                    <p className="text-gray-900">
                      <span className="font-semibold">Tel:</span> {shippingAddress.phone}
                    </p>
                  )}
                  {shippingAddress.street && (
                    <p className="text-gray-900 font-medium">
                      {shippingAddress.street}
                      {shippingAddress.number && ` ${shippingAddress.number}`}
                    </p>
                  )}
                  {shippingAddress.apartment && (
                    <p className="text-gray-900">{shippingAddress.apartment}</p>
                  )}
                  {(shippingAddress.city || shippingAddress.state || shippingAddress.zipCode) && (
                    <p className="text-gray-900 font-medium">
                      {[shippingAddress.city, shippingAddress.state, shippingAddress.zipCode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                  {shippingAddress.country && (
                    <p className="text-gray-900 font-medium">{shippingAddress.country}</p>
                  )}
                  {shippingAddress.notes && (
                    <div className="mt-3 pt-3 border-t-2 border-gray-300">
                      <p className="text-sm font-semibold text-gray-700">NOTAS IMPORTANTES:</p>
                      <p className="text-gray-900 font-medium">{shippingAddress.notes}</p>
                    </div>
                  )}
                </div>
              )
            ) : (
              <p className="text-gray-600">No se especificó dirección de envío</p>
            )}
          </div>

          {/* Productos */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-gray-300 pb-2">
              🛍️ PRODUCTOS A PREPARAR
            </h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="text-left p-3 font-semibold">CANT.</th>
                  <th className="text-left p-3 font-semibold">PRODUCTO</th>
                  <th className="text-right p-3 font-semibold">PRECIO UNIT.</th>
                  <th className="text-right p-3 font-semibold">SUBTOTAL</th>
                  <th className="text-center p-3 font-semibold w-20">✓</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any, index: number) => (
                  <tr key={item.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="p-3 border-b border-gray-300">
                      <span className="text-2xl font-bold text-gray-900">{item.quantity}</span>
                    </td>
                    <td className="p-3 border-b border-gray-300">
                      <p className="font-medium text-gray-900">{item.product?.name || "Producto eliminado"}</p>
                      {item.product?.sku && (
                        <p className="text-sm text-gray-600">SKU: {item.product.sku}</p>
                      )}
                    </td>
                    <td className="p-3 border-b border-gray-300 text-right text-gray-900">
                      ${formatPrice(item.unitPrice)}
                    </td>
                    <td className="p-3 border-b border-gray-300 text-right font-semibold text-gray-900">
                      ${formatPrice(item.quantity * item.unitPrice)}
                    </td>
                    <td className="p-3 border-b border-gray-300 text-center">
                      <div className="w-8 h-8 border-2 border-gray-400 rounded mx-auto"></div>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>

          {/* Totales */}
          <div className="mb-6">
            <div className="max-w-md ml-auto space-y-2">
              <div className="flex justify-between text-gray-900">
                <span>Subtotal:</span>
                <span className="font-semibold">${formatPrice(order.subtotal)}</span>
              </div>
              {order.shipping > 0 && (
                <div className="flex justify-between text-gray-900">
                  <span>Envío:</span>
                  <span className="font-semibold">${formatPrice(order.shipping)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento:</span>
                  <span className="font-semibold">-${formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-2xl font-bold text-gray-900 pt-2 border-t-2 border-gray-800">
                <span>TOTAL:</span>
                <span>${formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer con información de pago */}
          <div className="mt-8 pt-6 border-t-2 border-gray-300">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Método de Pago</p>
                <p className="font-semibold text-gray-900">Mercado Pago</p>
                {order.mpPaymentId && (
                  <p className="text-xs text-gray-600 font-mono mt-1">ID: {order.mpPaymentId}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-gray-600">Moneda</p>
                <p className="font-semibold text-gray-900">{order.currency}</p>
              </div>
            </div>
          </div>

          {/* Notas adicionales */}
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm font-semibold text-gray-700">NOTAS INTERNAS:</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">□ Productos verificados</p>
              <p className="text-sm text-gray-600">□ Empaquetado completo</p>
              <p className="text-sm text-gray-600">□ Etiqueta de envío adherida</p>
              <p className="text-sm text-gray-600">□ Listo para despacho</p>
            </div>
          </div>

          {/* Firma */}
          <div className="mt-8 pt-6 border-t border-gray-300">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm text-gray-600 mb-8">Preparado por:</p>
                <div className="border-t border-gray-400 pt-2">
                  <p className="text-sm text-gray-600">Firma y Aclaración</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-8">Fecha:</p>
                <div className="border-t border-gray-400 pt-2">
                  <p className="text-sm text-gray-600">____ / ____ / ________</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
