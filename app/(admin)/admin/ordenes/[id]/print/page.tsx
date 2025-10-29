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
    <div className="min-h-screen bg-white p-8 print:p-0 print:m-0">
        {/* Botón Imprimir - Solo visible en pantalla */}
        <PrintActions />

        {/* Contenido imprimible - Optimizado para A4 */}
        <div className="max-w-5xl mx-auto bg-white print:max-w-full print:p-3 print:text-xs">
          {/* Header - Compacto */}
          <div className="border-b-2 border-gray-800 pb-2 mb-3 print:pb-1 print:mb-2">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-1 print:text-xl print:mb-0">WOKY KIDS</h1>
                <p className="text-gray-600 print:text-[10px]">Orden de Preparación</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 print:text-[9px]">Orden #</p>
                <p className="text-2xl font-bold text-gray-900 print:text-base">{order.id.slice(0, 8)}</p>
                <p className="text-sm text-gray-600 mt-1 print:text-[9px] print:mt-0">{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Estados - Compacto */}
          <div className="mb-4 p-3 bg-gray-50 rounded print:mb-2 print:p-1.5">
            <div>
              <span className="text-sm text-gray-600 font-medium print:text-[9px]">Estado de Pago: </span>
              <span className="text-lg font-bold text-gray-900 print:text-xs">{statusLabels[order.status]}</span>
            </div>
          </div>

          {/* Información del Cliente - Compacto */}
          <div className="mb-4 print:mb-2">
            <h2 className="text-lg font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1 print:text-xs print:mb-1 print:pb-0.5">
              📋 DATOS DEL CLIENTE
            </h2>
            <div className="grid grid-cols-2 gap-2 print:gap-1">
              <div>
                <span className="text-sm text-gray-600 print:text-[9px]">Nombre: </span>
                <span className="font-medium text-gray-900 print:text-[10px]">{customerData?.name || order.user?.name || "N/A"}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600 print:text-[9px]">Email: </span>
                <span className="font-medium text-gray-900 print:text-[9px]">{order.email}</span>
              </div>
              {customerData?.phone && (
                <div className="col-span-2">
                  <span className="text-sm text-gray-600 print:text-[9px]">Teléfono: </span>
                  <span className="font-medium text-gray-900 print:text-[10px]">{customerData.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dirección de Envío - Compacto */}
          <div className="mb-4 p-3 border-2 border-gray-800 rounded bg-yellow-50 print:mb-2 print:p-1.5 print:border">
            <h2 className="text-lg font-bold text-gray-900 mb-2 print:text-xs print:mb-1">
              📦 DIRECCIÓN DE ENVÍO
            </h2>
            {shippingAddress ? (
              typeof shippingAddress === 'string' ? (
                <p className="text-gray-900 font-medium print:text-[10px] print:leading-tight">{shippingAddress}</p>
              ) : (
                <div className="space-y-1 print:space-y-0 print:text-[10px] print:leading-tight">
                  {shippingAddress.name && (
                    <p className="font-bold text-gray-900">{shippingAddress.name}</p>
                  )}
                  {shippingAddress.phone && (
                    <span className="text-gray-900">Tel: {shippingAddress.phone} | </span>
                  )}
                  {shippingAddress.street && (
                    <span className="text-gray-900 font-medium">
                      {shippingAddress.street}
                      {shippingAddress.number && ` ${shippingAddress.number}`}
                      {shippingAddress.apartment && `, ${shippingAddress.apartment}`}
                    </span>
                  )}
                  {(shippingAddress.city || shippingAddress.state || shippingAddress.zipCode) && (
                    <p className="text-gray-900">
                      {[shippingAddress.city, shippingAddress.state, shippingAddress.zipCode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                  {shippingAddress.notes && (
                    <p className="text-gray-900 font-semibold mt-1 print:mt-0">⚠️ {shippingAddress.notes}</p>
                  )}
                </div>
              )
            ) : (
              <p className="text-gray-600 print:text-[10px]">No se especificó dirección de envío</p>
            )}
          </div>

          {/* Productos - Compacto */}
          <div className="mb-4 print:mb-2">
            <h2 className="text-lg font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1 print:text-xs print:mb-1 print:pb-0.5">
              🛍️ PRODUCTOS A PREPARAR
            </h2>
            <table className="w-full border-collapse print:text-[10px]">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="text-left p-2 font-semibold print:p-0.5 print:text-[9px]">CANT.</th>
                  <th className="text-left p-2 font-semibold print:p-0.5 print:text-[9px]">PRODUCTO</th>
                  <th className="text-right p-2 font-semibold print:p-0.5 print:text-[9px]">PRECIO UNIT.</th>
                  <th className="text-right p-2 font-semibold print:p-0.5 print:text-[9px]">SUBTOTAL</th>
                  <th className="text-center p-2 font-semibold w-12 print:p-0.5 print:w-6 print:text-[9px]">✓</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item: any, index: number) => (
                  <tr key={item.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="p-2 border-b border-gray-300 print:p-0.5">
                      <span className="text-xl font-bold text-gray-900 print:text-sm">{item.quantity}</span>
                    </td>
                    <td className="p-2 border-b border-gray-300 print:p-0.5">
                      <p className="font-medium text-gray-900 print:text-[10px] print:leading-tight">{item.product?.name || "Producto eliminado"}</p>
                    </td>
                    <td className="p-2 border-b border-gray-300 text-right text-gray-900 print:p-0.5">
                      ${formatPrice(item.unitPrice)}
                    </td>
                    <td className="p-2 border-b border-gray-300 text-right font-semibold text-gray-900 print:p-0.5">
                      ${formatPrice(item.quantity * item.unitPrice)}
                    </td>
                    <td className="p-2 border-b border-gray-300 text-center print:p-0.5">
                      <div className="w-6 h-6 border-2 border-gray-400 rounded mx-auto print:w-3 print:h-3 print:border"></div>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>

          {/* Totales - Compacto */}
          <div className="mb-4 print:mb-2">
            <div className="max-w-md ml-auto space-y-1 print:space-y-0 print:text-[10px]">
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
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t-2 border-gray-800 print:text-sm print:pt-0.5 print:border-t">
                <span>TOTAL:</span>
                <span>${formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer - Muy compacto */}
          <div className="mt-4 pt-2 border-t border-gray-300 print:mt-2 print:pt-1">
            <div className="flex justify-between text-sm print:text-[9px]">
              <div>
                <span className="text-gray-600">Método: </span>
                <span className="font-semibold text-gray-900">Mercado Pago</span>
              </div>
              <div>
                <span className="text-gray-600">Moneda: </span>
                <span className="font-semibold text-gray-900">{order.currency}</span>
              </div>
            </div>
          </div>

          {/* Notas - Compacto */}
          <div className="mt-4 p-2 bg-gray-100 rounded print:mt-2 print:p-1 print:text-[9px]">
            <p className="text-sm font-semibold text-gray-700 print:text-[9px]">NOTAS:</p>
            <p className="text-sm text-gray-600 print:text-[8px] print:leading-tight">□ Productos verificados □ Empaquetado □ Etiqueta adherida □ Listo</p>
          </div>

          {/* Firma - Compacto */}
          <div className="mt-4 pt-2 border-t border-gray-300 grid grid-cols-2 gap-4 print:mt-2 print:pt-1 print:gap-2 print:text-[9px]">
            <div>
              <p className="text-sm text-gray-600 print:text-[8px]">Preparado por: _________________</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 print:text-[8px]">Fecha: ____ / ____ / ____</p>
            </div>
          </div>
        </div>
      </div>
  );
}
