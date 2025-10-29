import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Intentar una query simple
    const orderCount = await db.order.count();
    
    // Intentar obtener una orden con select explícito
    const firstOrder = await db.order.findFirst({
      select: {
        id: true,
        status: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      prismaVersion: "6.18.0",
      orderCount,
      firstOrder: firstOrder || "No orders found",
      message: "Prisma client working correctly",
    });
  } catch (error) {
    console.error("Diagnostic error:", error);
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
