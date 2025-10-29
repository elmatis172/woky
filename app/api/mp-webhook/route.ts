import { db } from "@/lib/db";
import { getPayment } from "@/lib/mp";
import { NextRequest, NextResponse } from "next/server";

/**
 * Webhook de Mercado Pago
 * Verifica y procesa notificaciones de pagos
 * IMPORTANTE: Siempre consultar el pago a la API de MP, no confiar solo en el payload
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const searchParams = req.nextUrl.searchParams;

    // Mercado Pago envía el tipo de notificación
    const topic = searchParams.get("topic") || body.topic || body.type;
    const id = searchParams.get("id") || body.data?.id || body.id;

    console.log("Webhook received:", { topic, id });

    // Solo procesar notificaciones de pagos
    if (topic !== "payment" && topic !== "merchant_order") {
      return NextResponse.json({ received: true });
    }

    if (!id) {
      console.error("No payment ID in webhook");
      return NextResponse.json(
        { error: "No payment ID" },
        { status: 400 }
      );
    }

    // SEGURIDAD: Consultar el pago directamente a la API de MP
    let payment;
    try {
      payment = await getPayment(id.toString());
    } catch (error) {
      console.error("Error fetching payment from MP:", error);
      return NextResponse.json(
        { error: "Error al consultar pago" },
        { status: 500 }
      );
    }

    if (!payment) {
      return NextResponse.json(
        { error: "Pago no encontrado" },
        { status: 404 }
      );
    }

    // Obtener external_reference (order ID)
    const orderId = payment.external_reference;
    if (!orderId) {
      console.error("No external_reference in payment");
      return NextResponse.json({ received: true });
    }

    // Buscar la orden
    const order = await db.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        status: true,
        userId: true,
        email: true,
        totalAmount: true,
        timeline: true,
      },
    });

    if (!order) {
      console.error("Order not found:", orderId);
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // IDEMPOTENCIA: Si la orden ya está pagada, no hacer nada
    if (order.status === "PAID") {
      console.log("Order already paid:", orderId);
      return NextResponse.json({ received: true, alreadyPaid: true });
    }

    // Determinar el nuevo estado según el status del pago
    let newStatus: "PAID" | "FAILED" | "CANCELLED" | "PENDING" | "REFUNDED" = "PENDING";
    let note = "";

    switch (payment.status) {
      case "approved":
        newStatus = "PAID";
        note = `Pago aprobado. ID: ${payment.id}`;
        break;
      case "rejected":
        newStatus = "FAILED";
        note = `Pago rechazado. Razón: ${payment.status_detail}`;
        break;
      case "cancelled":
        newStatus = "CANCELLED";
        note = "Pago cancelado";
        break;
      case "refunded":
        newStatus = "REFUNDED";
        note = "Pago reembolsado";
        break;
      case "in_process":
      case "pending":
        newStatus = "PENDING";
        note = "Pago pendiente de aprobación";
        break;
      default:
        note = `Estado: ${payment.status}`;
    }

    // Actualizar la orden
    const currentTimeline = order.timeline ? JSON.parse(order.timeline as string) : [];
    const updatedTimeline = [
      ...currentTimeline,
      {
        status: newStatus,
        timestamp: new Date().toISOString(),
        note,
        paymentId: payment.id,
        paymentStatus: payment.status,
      },
    ];

    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        mpPaymentId: payment.id?.toString(),
        timeline: JSON.stringify(updatedTimeline),
      },
      select: {
        id: true,
        status: true,
      },
    });

    // Si el pago fue aprobado, decrementar stock
    if (newStatus === "PAID") {
      const items = await db.orderItem.findMany({
        where: { orderId: order.id },
      });

      for (const item of items) {
        if (item.productId) {
          await db.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      // Aquí podrías enviar email de confirmación, notificar a Slack, etc.
      console.log("✅ Payment approved for order:", orderId);
    }

    return NextResponse.json({
      received: true,
      orderId,
      status: newStatus,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Error procesando webhook" },
      { status: 500 }
    );
  }
}

// Mercado Pago puede enviar GET para verificar el endpoint
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
