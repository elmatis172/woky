import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Listar todos los métodos de envío
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const shippingMethods = await db.shippingMethod.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(shippingMethods);
  } catch (error) {
    console.error("Error fetching shipping methods:", error);
    return NextResponse.json(
      { error: "Error al obtener los métodos de envío" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo método de envío
export async function POST(request: Request) {
  try {
    const session = await auth();

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

    // Validaciones
    if (!name || !type || cost === undefined) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    const shippingMethod = await db.shippingMethod.create({
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

    return NextResponse.json(shippingMethod, { status: 201 });
  } catch (error) {
    console.error("Error creating shipping method:", error);
    return NextResponse.json(
      { error: "Error al crear el método de envío" },
      { status: 500 }
    );
  }
}
