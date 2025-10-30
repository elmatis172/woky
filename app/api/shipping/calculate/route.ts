import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAvailableShippingOptions } from "@/lib/mercado-envios";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { zipCode, province, items } = body;

    if (!zipCode || !province || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Obtener productos con sus dimensiones
    const productIds = items.map((item: any) => item.productId);
    const products = await db.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        weight: true,
        width: true,
        height: true,
        length: true,
      },
    });

    // Mapear items con dimensiones
    const itemsWithDimensions = items.map((item: any) => {
      const product = products.find((p: any) => p.id === item.productId);
      return {
        id: item.productId,
        quantity: item.quantity,
        weight: product?.weight,
        width: product?.width,
        height: product?.height,
        length: product?.length,
      };
    });

    // Calcular total del carrito
    const cartTotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Obtener métodos locales activos
    const localMethods = await db.shippingMethod.findMany({
      where: { isActive: true },
    });

    // Obtener todas las opciones (locales + Mercado Envíos)
    const options = await getAvailableShippingOptions({
      zipCode,
      province,
      cartTotal,
      items: itemsWithDimensions,
      localMethods,
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error("Error calculating shipping:", error);
    return NextResponse.json(
      { error: "Error al calcular opciones de envío" },
      { status: 500 }
    );
  }
}
