import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // 1. Verificar productos con dimensiones
    const products = await db.product.findMany({
      select: {
        id: true,
        name: true,
        weight: true,
        width: true,
        height: true,
        length: true,
      },
    });

    const productsWithDimensions = products.filter(
      (p) => p.weight && p.width && p.height && p.length
    );

    // 2. Verificar variables de entorno
    const envCheck = {
      MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN ? "✅ Configurado" : "❌ No configurado",
      MP_PUBLIC_KEY: process.env.MP_PUBLIC_KEY ? "✅ Configurado" : "❌ No configurado",
      DATABASE_URL: process.env.DATABASE_URL ? "✅ Configurado" : "❌ No configurado",
    };

    // 3. Verificar métodos de envío
    const shippingMethods = await db.shippingMethod.findMany({
      where: { isActive: true },
    });

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      products: {
        total: products.length,
        withDimensions: productsWithDimensions.length,
        list: productsWithDimensions.map((p) => ({
          name: p.name,
          weight: `${p.weight}g`,
          dimensions: `${p.length}x${p.width}x${p.height} cm`,
        })),
      },
      environment: envCheck,
      shippingMethods: {
        total: shippingMethods.length,
        active: shippingMethods.filter((m) => m.isActive).length,
        list: shippingMethods.map((m) => ({
          name: m.name,
          type: m.type,
          cost: `$${m.cost / 100}`,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
