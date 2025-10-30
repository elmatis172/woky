import { db } from "../lib/db";

async function cleanAndSeedTestProduct() {
  console.log("🗑️  Limpiando productos existentes...");

  // Eliminar todos los productos
  await db.product.deleteMany({});
  console.log("✅ Productos eliminados");

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
        "/kids-hero.png", // Usamos la imagen que ya tenés
        "/kids-hero.png",
      ]),
      status: "PUBLISHED",
      featured: true,

      // Dimensiones para Mercado Envíos
      weight: 250, // 250 gramos
      width: 25, // 25 cm
      height: 2, // 2 cm (doblada)
      length: 30, // 30 cm

      categoryId: null, // Sin categoría por ahora
    },
  });

  console.log("✅ Producto de prueba creado:");
  console.log("   - ID:", testProduct.id);
  console.log("   - Nombre:", testProduct.name);
  console.log("   - Precio: $15,000 (antes $20,000)");
  console.log("   - Stock: 50 unidades");
  console.log("   - Dimensiones: 30x25x2 cm, 250g");
  console.log("   - ✅ Listo para Mercado Envíos");
  console.log("\n🎉 Base de datos lista para pruebas!");
}

cleanAndSeedTestProduct()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
