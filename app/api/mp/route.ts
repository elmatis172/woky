import { db } from "@/lib/db";
import { createPreference } from "@/lib/mp";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
  email: z.string().email(),
  customerData: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, email, customerData } = createOrderSchema.parse(body);

    // Obtener productos y verificar stock
    const productIds = items.map((item) => item.productId);
    const products = await db.product.findMany({
      where: {
        id: { in: productIds },
        status: "PUBLISHED",
      },
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        { error: "Algunos productos no están disponibles" },
        { status: 400 }
      );
    }

    // Verificar stock suficiente
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error("Producto no encontrado");
      }
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${product.name}`);
      }
      return {
        productId: product.id,
        name: product.name,
        sku: product.sku || "",
        unitPrice: product.price,
        quantity: item.quantity,
        image: product.images[0] || null,
      };
    });

    // Calcular totales
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const shipping = 0; // Calcular según lógica de envío
    const discount = 0; // Aplicar cupones si existen
    const totalAmount = subtotal + shipping - discount;

    // Crear orden en base de datos
    const order = await db.order.create({
      data: {
        email,
        status: "PENDING",
        currency: "ARS",
        subtotal,
        shipping,
        discount,
        totalAmount,
        customerData: JSON.stringify(customerData || {}),
        timeline: JSON.stringify([
          {
            status: "PENDING",
            timestamp: new Date().toISOString(),
            note: "Orden creada",
          },
        ]),
        items: {
          create: orderItems,
        },
      },
      select: {
        id: true,
        email: true,
        status: true,
        totalAmount: true,
        items: {
          select: {
            id: true,
            name: true,
            quantity: true,
            unitPrice: true,
          },
        },
      },
    });

    // Crear preferencia de Mercado Pago
    const preferenceItems = orderItems.map((item) => ({
      title: item.name,
      quantity: item.quantity,
      unit_price: item.unitPrice / 100, // MP trabaja en pesos, no centavos
      currency_id: "ARS",
    }));

    const preference = await createPreference({
      orderId: order.id,
      items: preferenceItems,
      payer: {
        email: email,
        name: customerData?.name,
      },
    });

    // Actualizar orden con el preference_id
    await db.order.update({
      where: { id: order.id },
      data: { mpPreferenceId: preference.id },
      select: {
        id: true,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    });
  } catch (error) {
    console.error("Error creating MP preference:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Error al procesar el pago" },
      { status: 500 }
    );
  }
}
