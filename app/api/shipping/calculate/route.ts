import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAvailableShippingOptions } from "@/lib/mercado-envios";
import { calculateOCAShipping } from "@/lib/oca";
import { getShipNowQuote } from "@/lib/shipnow";

// Tipo base para opciones de envío
type ShippingOption = {
  id: string;
  name: string;
  type: string;
  cost: number;
  estimatedDays: string | null;
  isMercadoEnvios: boolean;
  mercadoEnviosId?: number;
  isOCA?: boolean;
  provinces: string | null;
  minAmount: number | null;
  maxAmount: number | null;
};

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

    // Agregar opciones de OCA
    let ocaOptions: ShippingOption[] = [];
    try {
      ocaOptions = await calculateOCAShipping({
        items: itemsWithDimensions.map((item: any) => ({
          weight: item.weight,
          width: item.width,
          height: item.height,
          length: item.length,
          price: items.find((i: any) => i.productId === item.id)?.price || 0,
          quantity: item.quantity,
        })),
        zipCode,
      });

      console.log(`🚚 Opciones OCA: ${ocaOptions.length}`);

      // Agregar opciones de OCA al total
      options.all = [...options.all, ...ocaOptions] as ShippingOption[];
    } catch (ocaError) {
      console.error("⚠️ Error calculando envíos OCA:", ocaError);
    }

    // Agregar opciones de ShipNow
    let shipNowOptions: ShippingOption[] = [];
    try {
      // Calcular peso total del paquete
      const totalWeight = itemsWithDimensions.reduce(
        (sum: number, item: any) => sum + (item.weight || 0) * item.quantity,
        0
      );

      const shipNowResponse = await getShipNowQuote({
        to_zip_code: zipCode,
        weight: totalWeight || 500, // peso en gramos, mínimo 500g
        types: "ship_pap,ship_pas", // domicilio y sucursal
        categories: "economic", // estándar (agregar "super_express" si lo necesitas)
        mode: "delivery", // entregas (usar "exchange" para devoluciones)
      });

      if (shipNowResponse.success && shipNowResponse.quotes.length > 0) {
        shipNowOptions = shipNowResponse.quotes.map((quote) => ({
          id: quote.serviceId,
          name: `${quote.carrier} - ${quote.serviceName}`,
          type: "SHIPNOW",
          cost: quote.tax_price, // Usar precio con IVA
          estimatedDays: quote.estimatedDeliveryDays 
            ? `Entrega en ${quote.estimatedDeliveryDays} días`
            : quote.minimum_delivery && quote.maximum_delivery
            ? `Entre ${new Date(quote.minimum_delivery).toLocaleDateString()} y ${new Date(quote.maximum_delivery).toLocaleDateString()}`
            : undefined,
          isMercadoEnvios: false,
          isShipNow: true,
          shipNowServiceId: quote.serviceId,
          carrier: quote.carrier,
          provinces: null,
          minAmount: null,
          maxAmount: null,
        }));

        console.log(`🚀 Opciones ShipNow: ${shipNowOptions.length}`);
        options.all = [...options.all, ...shipNowOptions] as ShippingOption[];
      }
    } catch (shipNowError) {
      console.error("⚠️ Error calculando envíos ShipNow:", shipNowError);
    }

    return NextResponse.json({
      success: true,
      local: options.local,
      mercadoEnvios: options.mercadoEnvios,
      oca: ocaOptions,
      shipNow: shipNowOptions,
      all: options.all,
    });
  } catch (error) {
    console.error("❌ Error en /api/shipping/calculate:", error);
    return NextResponse.json(
      { error: "Error al calcular envío" },
      { status: 500 }
    );
  }
}
