import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, image } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: name, slug" },
        { status: 400 }
      );
    }

    // Verificar que el slug sea único
    const existingCategory = await db.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Ya existe una categoría con este slug" },
        { status: 400 }
      );
    }

    const category = await db.category.create({
      data: {
        name,
        slug,
        description: description || null,
        image: image || null,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Error al crear la categoría" },
      { status: 500 }
    );
  }
}
