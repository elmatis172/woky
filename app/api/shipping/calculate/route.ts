import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAvailableShippingOptions } from "@/lib/mercado-envios";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { zipCode, province, items } = body;

    console.log("📬 Solicitud de cálculo de envío:");
    console.log(`   - CP: ${zipCode}`);
    console.log(`   - Provincia: ${province}`);
    console.log(`   - Items: ${items?.length || 0}`);

    if (!zipCode || !province || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Obtener IDs de productos para buscar dimensiones
    const productIds = items.map((item: any) => item.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
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

    console.log("📦 Items con dimensiones mapeados:", JSON.stringify(itemsWithDimensions, null, 2));

    // Calcular total del carrito
    const cartTotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Obtener métodos locales activos
    const localMethods = await db.shippingMethod.findMany({
      where: { isActive: true },
    });

    console.log(`📋 Métodos locales activos: ${localMethods.length}`);

    // Obtener todas las opciones (locales + Mercado Envíos)
    const options = await getAvailableShippingOptions({
      zipCode,
      province,
      cartTotal,
      items: itemsWithDimensions,
      localMethods,
    });

    console.log("✅ Opciones calculadas:");
    console.log(`   - Locales: ${options.local.length}`);
    console.log(`   - Mercado Envíos: ${options.mercadoEnvios.length}`);
    console.log(`   - Total: ${options.all.length}`);

    return NextResponse.json(options);
  } catch (error) {
    console.error("❌ Error en /api/shipping/calculate:", error);
    return NextResponse.json(
      { error: "Error al calcular envío" },
      { status: 500 }
    );
  }
}
