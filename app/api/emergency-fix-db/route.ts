import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

// EMERGENCY: Drop shippingStatus column from Order table
export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    // Password de seguridad
    if (password !== "emergency-fix-2729194801") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting emergency database fix...");

    // 1. Verificar si la columna existe
    const checkColumn = await db.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Order' AND column_name = 'shippingStatus';
    `;

    console.log("Column check result:", checkColumn);

    // 2. Si existe, eliminarla
    if (Array.isArray(checkColumn) && checkColumn.length > 0) {
      console.log("Column shippingStatus exists, dropping it...");
      
      await db.$executeRaw`
        ALTER TABLE "Order" DROP COLUMN IF EXISTS "shippingStatus";
      `;

      console.log("Column dropped successfully");
    } else {
      console.log("Column shippingStatus does not exist");
    }

    // 3. Verificar la estructura final
    const finalStructure = await db.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Order'
      ORDER BY ordinal_position;
    `;

    return NextResponse.json({
      success: true,
      message: "Database fix completed",
      columnExisted: Array.isArray(checkColumn) && checkColumn.length > 0,
      finalStructure,
    });

  } catch (error) {
    console.error("Emergency fix error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
