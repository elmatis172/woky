import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
    const featured = searchParams.get("featured");

    const products = await db.product.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(categoryId && { categoryId }),
        ...(featured === "true" && { featured: true }),
      },
      include: {
        category: true,
        variants: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      description,
      price,
      compareAtPrice,
      sku,
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

    // Validaciones básicas
    if (!name || !slug || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: name, slug, price, stock" },
        { status: 400 }
      );
    }

    // Verificar que el slug sea único
    const existingProduct = await db.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "Ya existe un producto con este slug" },
        { status: 400 }
      );
    }

    // Crear el producto con variantes
    const product = await db.product.create({
      data: {
        name,
        slug,
        description: description || "",
        price: Number(price),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        sku: sku || "",
        stock: Number(stock),
        images: JSON.stringify(images || []),
        categoryId: categoryId || null,
        status: status || "DRAFT",
        featured: featured || false,
        weight: weight ? Number(weight) : null,
        width: width ? Number(width) : null,
        height: height ? Number(height) : null,
        length: length ? Number(length) : null,
        hasVariants: hasVariants || false,
        variants: hasVariants && variants ? {
          create: variants.map((v: any, index: number) => ({
            size: v.size,
            sku: v.sku || null,
            stock: Number(v.stock),
            price: v.price ? Number(v.price) : null,
            sortOrder: v.sortOrder ?? index,
            isActive: v.isActive ?? true,
          }))
        } : undefined,
      },
      include: {
        category: true,
        variants: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Error al crear el producto" },
      { status: 500 }
    );
  }
}
