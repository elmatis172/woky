import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/admin/orders/delete - Start");
    
    // Verificar autenticación
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      console.log("POST /api/admin/orders/delete - Unauthorized");
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { orderId } = body;
    
    console.log("POST /api/admin/orders/delete - Order ID:", orderId);

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID requerido" },
        { status: 400 }
      );
    }

    // Verificar que la orden existe
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.log("POST /api/admin/orders/delete - Order not found");
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar la orden (esto también eliminará los OrderItems por cascade)
    await db.order.delete({
      where: { id: orderId },
    });

    console.log("POST /api/admin/orders/delete - Order deleted successfully");

    // Registrar en audit log
    await db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "DELETE",
        entity: "Order",
        entityId: orderId,
        metadata: {
          orderEmail: order.email,
          totalAmount: order.totalAmount,
          status: order.status,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Orden eliminada correctamente",
    });
  } catch (error) {
    console.error("POST /api/admin/orders/delete - Error:", error);
    return NextResponse.json(
      { error: "Error al eliminar la orden" },
      { status: 500 }
    );
  }
}
