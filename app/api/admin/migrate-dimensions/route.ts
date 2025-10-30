import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  try {
    // Ejecutar la migración para agregar campos de dimensiones
    await db.$executeRawUnsafe(`
      DO $$ 
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='Product' AND column_name='weight') THEN
              ALTER TABLE "Product" ADD COLUMN "weight" INTEGER;
          END IF;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='Product' AND column_name='width') THEN
              ALTER TABLE "Product" ADD COLUMN "width" INTEGER;
          END IF;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='Product' AND column_name='height') THEN
              ALTER TABLE "Product" ADD COLUMN "height" INTEGER;
          END IF;

          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='Product' AND column_name='length') THEN
              ALTER TABLE "Product" ADD COLUMN "length" INTEGER;
          END IF;
      END $$;
    `);

    // Verificar que se agregaron
    const result = await db.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Product' 
        AND column_name IN ('weight', 'width', 'height', 'length')
      ORDER BY column_name;
    `);

    return NextResponse.json({
      status: "success",
      message: "✅ Campos de dimensiones agregados correctamente",
      columns: result,
    });
  } catch (error) {
    console.error("Error en migración:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Solo verificar si existen los campos
    const result = await db.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Product' 
        AND column_name IN ('weight', 'width', 'height', 'length')
      ORDER BY column_name;
    `);

    const existingColumns = (result as any[]).map((r: any) => r.column_name);
    const requiredColumns = ['weight', 'width', 'height', 'length'];
    const missingColumns = requiredColumns.filter(c => !existingColumns.includes(c));

    return NextResponse.json({
      status: missingColumns.length === 0 ? "ok" : "incomplete",
      existingColumns,
      missingColumns,
      message: missingColumns.length === 0 
        ? "✅ Todos los campos de dimensiones existen" 
        : `⚠️ Faltan campos: ${missingColumns.join(', ')}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
