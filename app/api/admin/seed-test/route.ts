import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET para verificar autenticación
export async function GET() {
  try {
    const session = await auth();
    
    return NextResponse.json({
      authenticated: !!session,
      isAdmin: session?.user?.role === "ADMIN",
      user: session?.user ? {
        email: session.user.email,
        role: session.user.role,
        name: session.user.name,
      } : null,
      message: session?.user?.role === "ADMIN" 
        ? "✅ Estás autenticado como ADMIN. Podés usar POST para ejecutar el seed."
        : "❌ No tenés permisos de ADMIN. Iniciá sesión con una cuenta de administrador.",
    });
  } catch (error) {
    console.error("Error en GET:", error);
    return NextResponse.json({ error: "Error verificando autenticación" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log("🔍 Verificando autenticación...");
    const session = await auth();

    console.log("Session:", session ? "Existe" : "No existe");
    console.log("User role:", session?.user?.role);

    // Solo admins pueden ejecutar esto
    if (!session?.user || session.user.role !== "ADMIN") {
      console.log("❌ Usuario no autorizado");
      return NextResponse.json({ 
        error: "No autorizado. Debes estar logueado como ADMIN.",
        hasSession: !!session,
        userRole: session?.user?.role || "none"
      }, { status: 401 });
    }

    console.log("✅ Usuario autorizado");
    console.log("🗑️  Limpiando productos existentes...");

    // Eliminar todos los productos
    const deletedCount = await db.product.deleteMany({});
    console.log(`✅ ${deletedCount.count} productos eliminados`);

    console.log("\n📦 Creando producto de prueba con dimensiones completas...");

    // Crear producto de prueba
    const testProduct = await db.product.create({
      data: {
        name: "Remera Estampada WOKY Kids",
        slug: "remera-estampada-woky-kids",
        description:
          "Remera de algodón 100% con estampado colorido. Perfecta para niños de 4 a 8 años. Tela suave y cómoda, ideal para el uso diario.",
        sku: "WKY-REM-001",
        price: 1500000, // $15,000 en centavos
        compareAtPrice: 2000000, // $20,000 (25% OFF)
        currency: "ARS",
        stock: 50,
        images: JSON.stringify([
          "/kids-hero.png",
          "/kids-hero.png",
        ]),
        status: "PUBLISHED",
        featured: true,

        // Dimensiones para Mercado Envíos
        weight: 250, // 250 gramos
        width: 25, // 25 cm
        height: 2, // 2 cm (doblada)
        length: 30, // 30 cm

        categoryId: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Base de datos limpiada y producto de prueba creado",
      deletedProducts: deletedCount.count,
      testProduct: {
        id: testProduct.id,
        name: testProduct.name,
        price: `$${(testProduct.price / 100).toLocaleString("es-AR")}`,
        stock: testProduct.stock,
        dimensions: `${testProduct.length}x${testProduct.width}x${testProduct.height} cm`,
        weight: `${testProduct.weight}g`,
        hasDimensions: !!(
          testProduct.weight &&
          testProduct.width &&
          testProduct.height &&
          testProduct.length
        ),
      },
    });
  } catch (error) {
    console.error("❌ Error en seed:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json(
      { 
        error: "Error al ejecutar seed",
        details: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
