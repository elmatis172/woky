import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { blocked } = body;

    if (typeof blocked !== "boolean") {
      return NextResponse.json(
        { error: "El campo 'blocked' debe ser un booleano" },
        { status: 400 }
      );
    }

    // No permitir que un admin se bloquee a sí mismo
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "No podés bloquearte a vos mismo" },
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: { id },
      data: { blocked },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}
