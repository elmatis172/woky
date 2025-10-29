import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { shippingStatus } = body;

    const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
    
    if (!validStatuses.includes(shippingStatus)) {
      return NextResponse.json(
        { error: "Estado de envío inválido" },
        { status: 400 }
      );
    }

    const order = await db.order.update({
      where: { id },
      data: { shippingStatus },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Error al actualizar estado de envío:", error);
    return NextResponse.json(
      { error: "Error al actualizar estado de envío" },
      { status: 500 }
    );
  }
}
