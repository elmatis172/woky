import { db } from "@/lib/db";
import { createPreference } from "@/lib/mp";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().nullable().optional(), // ID de variante si existe
      quantity: z.number().int().positive(),
    })
  ),
  email: z.string().email(),
  customerData: z
    .object({
      fullName: z.string(),
      email: z.string().email(),
      phone: z.string(),
      shippingAddress: z.object({
        street: z.string(),
        number: z.string(),
        floor: z.string().optional(),
        city: z.string(),
        province: z.string(),
        postalCode: z.string().optional(),
        country: z.string(),
      }),
      billingData: z.object({
        invoiceType: z.string(),
        taxId: z.string(),
        businessName: z.string(),
      }),
      notes: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("MP API - Received body:", JSON.stringify(body, null, 2));
    
    const { items, email, customerData } = createOrderSchema.parse(body);

    // Obtener productos y verificar stock
    const productIds = items.map((item) => item.productId);
    console.log("MP API - Fetching products:", productIds);
    
    const products = await db.product.findMany({
      where: {
        id: { in: productIds },
        status: "PUBLISHED",
      },
    });

    console.log("MP API - Found products:", products.length);

    if (products.length !== items.length) {
      console.error("MP API - Product count mismatch:", {
        requested: items.length,
        found: products.length,
      });
      return NextResponse.json(
        { error: "Algunos productos no están disponibles" },
        { status: 400 }
      );
    }

        // Obtener variantes si existen
    const variantIds = items.filter(item => item.variantId).map(item => item.variantId as string);
    const variants = variantIds.length > 0 
      ? await db.productVariant.findMany({
          where: { id: { in: variantIds } },
          include: { product: true }
        })
      : [];

    console.log("MP API - Found variants:", variants.length);

    // Verificar stock suficiente y preparar items
    const orderItems = items.map((item) => {
      const product = products.find((p: any) => p.id === item.productId);
      if (!product) {
        throw new Error("Producto no encontrado");
      }

      // Si hay variante, usar su stock y precio
      if (item.variantId) {
        const variant = variants.find((v: any) => v.id === item.variantId);
        if (!variant) {
          throw new Error(`Variante no encontrada para ${product.name}`);
        }
        if (variant.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${product.name} - Talle ${variant.size}`);
        }
        return {`n          productId: product.id,`n          variantId: variant.id, // ID de la variante`n          name: `${product.name} - Talle ${variant.size}`,
          sku: variant.sku || product.sku || "",
          unitPrice: variant.price ?? product.price,
          quantity: item.quantity,
          image: product.images[0] || null,
          size: variant.size,
        };
      } else {
        // Sin variante, usar stock y precio del producto
        if (product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${product.name}`);
        }
        return {
          productId: product.id,`n          variantId: null, // Sin variante
          name: product.name,
          sku: product.sku || "",
          unitPrice: product.price,
          quantity: item.quantity,
          image: product.images[0] || null,
          size: null,
        };
      }
    });


    console.log("MP API - Order items prepared:", orderItems.length);

    // Calcular totales
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
    const shipping = 0; // Calcular según lógica de envío
    const discount = 0; // Aplicar cupones si existen
    const totalAmount = subtotal + shipping - discount;

    console.log("MP API - Totals calculated:", {
      subtotal,
      shipping,
      discount,
      totalAmount,
    });

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
        shippingAddress: customerData?.shippingAddress 
          ? JSON.stringify(customerData.shippingAddress) 
          : null,
        billingAddress: customerData?.billingData 
          ? JSON.stringify(customerData.billingData) 
          : null,
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

    console.log("MP API - Order created:", order.id);

    // Crear preferencia de Mercado Pago
    const preferenceItems = orderItems.map((item) => ({
      title: item.name,
      quantity: item.quantity,
      unit_price: item.unitPrice / 100, // MP trabaja en pesos, no centavos
      currency_id: "ARS",
    }));

    console.log("MP API - Creating MP preference with items:", preferenceItems);

    const preference = await createPreference({
      orderId: order.id,
      items: preferenceItems,
      payer: {
        email: email,
        name: customerData?.fullName,
      },
    });

    console.log("MP API - Preference created:", preference.id);

    // Actualizar orden con el preference_id
    await db.order.update({
      where: { id: order.id },
      data: { mpPreferenceId: preference.id },
      select: {
        id: true,
      },
    });

    console.log("MP API - Order updated with preference ID");

    return NextResponse.json({
      orderId: order.id,
      preferenceId: preference.id,
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
    });
  } catch (error) {
    console.error("MP API - Error details:", error);
    console.error("MP API - Error stack:", error instanceof Error ? error.stack : "No stack trace");

    if (error instanceof z.ZodError) {
      console.error("MP API - Zod validation error:", error.errors);
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      console.error("MP API - Error message:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Error al procesar el pago" },
      { status: 500 }
    );
  }
}





