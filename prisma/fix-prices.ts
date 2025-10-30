import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("🔧 Corrigiendo precios...\n");

  // Obtener todos los productos
  const products = await db.product.findMany();

  console.log(`📦 Productos encontrados: ${products.length}\n`);

  for (const product of products) {
    // Si el precio es menor a 1000 centavos ($10), probablemente esté mal
    if (product.price < 1000) {
      const newPrice = product.price * 100;
      const newCompareAtPrice = product.compareAtPrice 
        ? product.compareAtPrice * 100 
        : null;

      console.log(`✏️  ${product.name}`);
      console.log(`   Precio actual: $${product.price / 100} → Nuevo: $${newPrice / 100}`);
      
      await db.product.update({
        where: { id: product.id },
        data: {
          price: newPrice,
          compareAtPrice: newCompareAtPrice,
        },
      });

      console.log(`   ✅ Corregido\n`);
    } else {
      console.log(`✓  ${product.name} - Precio correcto: $${product.price / 100}\n`);
    }
  }

  console.log("✅ Todos los precios corregidos");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
