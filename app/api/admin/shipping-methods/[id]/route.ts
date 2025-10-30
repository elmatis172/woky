import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// PUT - Actualizar método de envío
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      type,
      cost,
      estimatedDays,
      isActive,
      provinces,
      minAmount,
      maxAmount,
    } = body;

    const shippingMethod = await db.shippingMethod.update({
      where: { id },
      data: {
        name,
        description,
        type,
        cost: Math.round(cost),
        estimatedDays,
        isActive,
        provinces,
        minAmount: minAmount ? Math.round(minAmount) : null,
        maxAmount: maxAmount ? Math.round(maxAmount) : null,
      },
    });

    return NextResponse.json(shippingMethod);
  } catch (error) {
    console.error("Error updating shipping method:", error);
    return NextResponse.json(
      { error: "Error al actualizar el método de envío" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar método de envío
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await db.shippingMethod.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting shipping method:", error);
    return NextResponse.json(
      { error: "Error al eliminar el método de envío" },
      { status: 500 }
    );
  }
}
