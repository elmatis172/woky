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
      tags,
      seoTitle,
      seoDescription,
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

    // Crear el producto
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
        tags: JSON.stringify(tags || []),
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
      },
      include: {
        category: true,
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
