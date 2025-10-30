import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST() {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    console.log("🚚 Creando métodos de envío...");

    // Envío local CABA y GBA
    const local = await db.shippingMethod.upsert({
      where: { id: "local-caba-gba" },
      update: {
        name: "Envío Local CABA/GBA",
        description: "Envío en el día para CABA y Gran Buenos Aires",
        type: "STANDARD",
        cost: 50000, // $500
        estimatedDays: "24 horas",
        isActive: true,
        provinces: JSON.stringify(["Buenos Aires", "Ciudad Autónoma de Buenos Aires"]),
      },
      create: {
        id: "local-caba-gba",
        name: "Envío Local CABA/GBA",
        description: "Envío en el día para CABA y Gran Buenos Aires",
        type: "STANDARD",
        cost: 50000,
        estimatedDays: "24 horas",
        isActive: true,
        provinces: JSON.stringify(["Buenos Aires", "Ciudad Autónoma de Buenos Aires"]),
      },
    });

    // Envío estándar nacional
    const standard = await db.shippingMethod.upsert({
      where: { id: "standard-nacional" },
      update: {
        name: "Envío a Domicilio",
        description: "Envío estándar a todo el país",
        type: "EXPRESS",
        cost: 150000, // $1500
        estimatedDays: "3-5 días hábiles",
        isActive: true,
        provinces: null,
      },
      create: {
        id: "standard-nacional",
        name: "Envío a Domicilio",
        description: "Envío estándar a todo el país",
        type: "EXPRESS",
        cost: 150000,
        estimatedDays: "3-5 días hábiles",
        isActive: true,
        provinces: null,
      },
    });

    // Retiro en sucursal
    const pickup = await db.shippingMethod.upsert({
      where: { id: "pickup-store" },
      update: {
        name: "Retiro en Sucursal",
        description: "Retirá tu pedido en nuestra sucursal",
        type: "PICKUP",
        cost: 0,
        estimatedDays: "Inmediato",
        isActive: true,
        provinces: null,
      },
      create: {
        id: "pickup-store",
        name: "Retiro en Sucursal",
        description: "Retirá tu pedido en nuestra sucursal",
        type: "PICKUP",
        cost: 0,
        estimatedDays: "Inmediato",
        isActive: true,
        provinces: null,
      },
    });

    return NextResponse.json({
      success: true,
      created: [local, standard, pickup],
      message: "✅ Métodos de envío creados correctamente"
    });

  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { error: "Error al crear métodos de envío", details: error },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const methods = await db.shippingMethod.findMany();
    
    return NextResponse.json({
      count: methods.length,
      methods,
    });

  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { error: "Error al obtener métodos de envío" },
      { status: 500 }
    );
  }
}
