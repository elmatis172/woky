import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    console.log("=== TEST ADMIN ENDPOINT ===");
    
    // Test 1: Database connection
    console.log("Test 1: Testing database connection...");
    const dbTest = await db.$queryRaw`SELECT 1 as test`;
    console.log("Database connected:", dbTest);

    // Test 2: Count products
    console.log("Test 2: Counting products...");
    const productCount = await db.product.count();
    console.log("Product count:", productCount);

    // Test 3: Count users
    console.log("Test 3: Counting users...");
    const userCount = await db.user.count();
    console.log("User count:", userCount);

    // Test 4: Check Order table structure
    console.log("Test 4: Checking Order table structure...");
    const orderColumns = await db.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Order'
      ORDER BY ordinal_position;
    `;
    console.log("Order columns:", orderColumns);

    // Test 5: Try to count orders (this might fail)
    console.log("Test 5: Trying to count orders...");
    try {
      const orderCount = await db.order.count();
      console.log("Order count:", orderCount);
    } catch (orderError: any) {
      console.error("Order count error:", orderError.message);
      return NextResponse.json({
        success: false,
        error: "Failed at order count",
        details: orderError.message,
        tests: {
          database: "✅ Connected",
          products: `✅ ${productCount} products`,
          users: `✅ ${userCount} users`,
          orderColumns: orderColumns,
          orderCount: "❌ " + orderError.message
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      tests: {
        database: "✅ Connected",
        products: `✅ ${productCount} products`,
        users: `✅ ${userCount} users`,
        orderColumns: orderColumns,
        orders: "✅ Order queries work"
      }
    });

  } catch (error: any) {
    console.error("=== DIAGNOSTIC ERROR ===");
    console.error("Error:", error);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      name: error.name
    }, { status: 500 });
  }
}
