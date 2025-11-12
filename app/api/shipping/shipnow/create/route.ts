import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createShipNowShipment } from "@/lib/shipnow";

/**
 * Crear envío con ShipNow después de una orden confirmada
 * POST /api/shipping/shipnow/create
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID es requerido" },
        { status: 400 }
      );
    }

    // Obtener orden con todos los datos
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Orden no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que la orden esté pagada
    if (order.status !== "PAID") {
      return NextResponse.json(
        { error: "La orden debe estar pagada para crear el envío" },
        { status: 400 }
      );
    }

    // Parsear datos del cliente
    const customerData = order.customerData as any;
    const shippingAddress = order.shippingAddress as any;

    if (!customerData || !shippingAddress) {
      return NextResponse.json(
        { error: "Datos de envío incompletos" },
        { status: 400 }
      );
    }

    // Verificar que se haya seleccionado ShipNow
    const shippingMethodId = (customerData.shippingMethodId || "").toString();
    if (!shippingMethodId.startsWith("shipnow-")) {
      return NextResponse.json(
        { error: "Método de envío no es ShipNow" },
        { status: 400 }
      );
    }

    // Extraer serviceId de ShipNow
    const shipNowServiceId = shippingMethodId.replace("shipnow-", "");

    // Calcular peso y dimensiones totales
    const totalWeight = order.items.reduce((sum, item) => {
      const weight = item.product?.weight || 500; // default 500g
      return sum + weight * item.quantity;
    }, 0);

    // Usar dimensiones del item más grande
    const largestItem = order.items.reduce((largest, item) => {
      const product = item.product;
      if (!product) return largest;
      
      const itemVolume = 
        (product.width || 0) * (product.height || 0) * (product.length || 0);
      const largestVolume = 
        (largest.width || 0) * (largest.height || 0) * (largest.length || 0);
      
      return itemVolume > largestVolume ? product : largest;
    }, order.items[0]?.product);

    // Crear el envío con ShipNow
    const shipmentRequest = {
      origin: {
        name: process.env.STORE_NAME || "Woky Kids Store",
        phone: process.env.STORE_PHONE || "+54 11 1234-5678",
        email: process.env.STORE_EMAIL || "tienda@woky.com",
        address: {
          street: process.env.STORE_STREET || "Av. Corrientes",
          number: process.env.STORE_NUMBER || "1234",
          floor: process.env.STORE_FLOOR || "",
          apartment: process.env.STORE_APARTMENT || "",
          city: process.env.STORE_CITY || "CABA",
          province: process.env.STORE_PROVINCE || "Buenos Aires",
          zipCode: process.env.STORE_ZIP_CODE || "1414",
          country: "Argentina",
        },
      },
      destination: {
        name: customerData.fullName || shippingAddress.fullName,
        phone: customerData.phone || shippingAddress.phone,
        email: order.email,
        address: {
          street: shippingAddress.street,
          number: shippingAddress.number,
          floor: shippingAddress.floor || "",
          apartment: shippingAddress.apartment || "",
          city: shippingAddress.city,
          province: shippingAddress.province,
          zipCode: shippingAddress.postalCode || shippingAddress.zipCode,
          country: shippingAddress.country || "Argentina",
        },
      },
      packages: [
        {
          weight: totalWeight,
          width: largestItem?.width || 20,
          height: largestItem?.height || 10,
          length: largestItem?.length || 30,
          declaredValue: order.totalAmount,
          description: `Orden #${order.id.substring(0, 8)} - ${order.items.length} items`,
        },
      ],
      serviceId: shipNowServiceId,
      reference: order.id,
    };

    console.log("📦 Creando envío ShipNow para orden:", order.id);
    const shipmentResponse = await createShipNowShipment(shipmentRequest);

    if (!shipmentResponse.success) {
      console.error("❌ Error creando envío ShipNow:", shipmentResponse.error);
      return NextResponse.json(
        { error: shipmentResponse.error || "Error creando envío" },
        { status: 500 }
      );
    }

    // Actualizar orden con datos del envío
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        shippingData: JSON.stringify({
          provider: "ShipNow",
          shipmentId: shipmentResponse.shipment?.id,
          trackingNumber: shipmentResponse.shipment?.trackingNumber,
          carrier: shipmentResponse.shipment?.carrier,
          labelUrl: shipmentResponse.shipment?.labelUrl,
          status: shipmentResponse.shipment?.status,
          createdAt: new Date().toISOString(),
        }),
      },
    });

    console.log("✅ Envío ShipNow creado exitosamente:", shipmentResponse.shipment?.trackingNumber);

    return NextResponse.json({
      success: true,
      shipment: shipmentResponse.shipment,
      order: {
        id: updatedOrder.id,
        trackingNumber: shipmentResponse.shipment?.trackingNumber,
      },
    });
  } catch (error) {
    console.error("❌ Error en /api/shipping/shipnow/create:", error);
    return NextResponse.json(
      { 
        error: "Error al crear envío",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    );
  }
}
