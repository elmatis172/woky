import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// EMERGENCY: Clear all orders if admin panel is broken
export async function POST() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Delete all order items first (foreign key constraint)
    const deletedItems = await db.orderItem.deleteMany({});
    
    // Then delete all orders
    const deletedOrders = await db.order.deleteMany({});

    return NextResponse.json({
      success: true,
      message: "All orders cleared successfully",
      deletedItems: deletedItems.count,
      deletedOrders: deletedOrders.count,
    });
  } catch (error) {
    console.error("Error clearing orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
