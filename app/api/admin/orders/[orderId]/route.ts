import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    console.log("DELETE /api/admin/orders/[orderId] - Start");
    
    // Verificar autenticación
    const session = await auth();
    
    if (!session?.user || session.user.role !== "ADMIN") {
      console.log("DELETE /api/admin/orders/[orderId] - Unauthorized");
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { orderId } = await context.params;
    console.log("DELETE /api/admin/orders/[orderId] - Order ID:", orderId);

    // Verificar que la orden existe
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar la orden (esto también eliminará los OrderItems por cascade)
    await db.order.delete({
      where: { id: orderId },
    });

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
    console.error("Error al eliminar orden:", error);
    return NextResponse.json(
      { error: "Error al eliminar la orden" },
      { status: 500 }
    );
  }
}
