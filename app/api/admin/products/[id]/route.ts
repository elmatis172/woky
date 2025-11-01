import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await context.params;

    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Error al obtener el producto" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const {
      name,
      slug,
      description,
      price,
      compareAtPrice,
      sku,
      cost,
      additionalCosts,
      stock,
      images,
      categoryId,
      status,
      featured,
      weight,
      width,
      height,
      length,
      hasVariants,
      variants,
    } = body;

    // Verificar que el producto existe
    const existingProduct = await db.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    // Verificar que el slug sea único (si cambió)
    if (slug !== existingProduct.slug) {
      const slugExists = await db.product.findUnique({
        where: { slug },
      });

      if (slugExists) {
        return NextResponse.json(
          { error: "Ya existe un producto con este slug" },
          { status: 400 }
        );
      }
    }

    // Eliminar variantes existentes si hasVariants cambió a false
    if (hasVariants === false) {
      await db.productVariant.deleteMany({
        where: { productId: id },
      });
    }

    // Actualizar el producto con variantes
    const product = await db.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        sku,
        cost: cost ? Number(cost) : null,
        additionalCosts: additionalCosts ? Number(additionalCosts) : null,
        stock: Number(stock),
        images: JSON.stringify(images),
        categoryId: categoryId || null,
        status,
        featured,
        weight: weight ? Number(weight) : null,
        width: width ? Number(width) : null,
        height: height ? Number(height) : null,
        length: length ? Number(length) : null,
        hasVariants: hasVariants || false,
      },
      include: {
        category: true,
        variants: true,
      },
    });

    // Manejar variantes si hasVariants es true
    if (hasVariants && variants) {
      // Eliminar variantes que ya no existen
      const variantSizes = variants.map((v: any) => v.size);
      await db.productVariant.deleteMany({
        where: {
          productId: id,
          size: { notIn: variantSizes },
        },
      });

      // Crear o actualizar variantes
      for (let index = 0; index < variants.length; index++) {
        const v = variants[index];
        await db.productVariant.upsert({
          where: {
            productId_size: {
              productId: id,
              size: v.size,
            },
          },
          create: {
            productId: id,
            size: v.size,
            sku: v.sku || null,
            stock: Number(v.stock),
            price: v.price ? Number(v.price) : null,
            sortOrder: v.sortOrder ?? index,
            isActive: v.isActive ?? true,
          },
          update: {
            sku: v.sku || null,
            stock: Number(v.stock),
            price: v.price ? Number(v.price) : null,
            sortOrder: v.sortOrder ?? index,
            isActive: v.isActive ?? true,
          },
        });
      }
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Error al actualizar el producto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await context.params;

    // Verificar que el producto existe
    const existingProduct = await db.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    // Eliminar el producto
    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Error al eliminar el producto" },
      { status: 500 }
    );
  }
}

