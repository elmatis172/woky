import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("📦 Agregando dimensiones al producto...\n");

  // Buscar la remera estampada
  const product = await db.product.findFirst({
    where: {
      name: { contains: "Remera" }
    }
  });

  if (!product) {
    console.log("❌ No se encontró el producto");
    return;
  }

  console.log(`✏️  Producto encontrado: ${product.name}`);
  console.log(`   ID: ${product.id}`);
  console.log(`   Dimensiones actuales:`);
  console.log(`     Peso: ${product.weight || 'NO CONFIGURADO'}`);
  console.log(`     Ancho: ${product.width || 'NO CONFIGURADO'}`);
  console.log(`     Alto: ${product.height || 'NO CONFIGURADO'}`);
  console.log(`     Largo: ${product.length || 'NO CONFIGURADO'}\n`);

  // Actualizar con dimensiones típicas de una remera
  await db.product.update({
    where: { id: product.id },
    data: {
      weight: 250,  // 250 gramos
      width: 25,    // 25 cm
      height: 2,    // 2 cm (doblada)
      length: 30,   // 30 cm
    },
  });

  console.log("✅ Dimensiones actualizadas:");
  console.log("   Peso: 250g");
  console.log("   Dimensiones: 30x25x2 cm (LxAxA)");
  console.log("\n🎉 ¡Listo! Ahora Mercado Envíos podrá calcular el costo de envío.");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
