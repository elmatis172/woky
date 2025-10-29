import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Buscando productos y usuarios...");

  // Buscar un producto existente
  const product = await prisma.product.findFirst({
    where: {
      status: "PUBLISHED",
    },
  });

  if (!product) {
    console.error("❌ No hay productos disponibles. Por favor crea un producto primero.");
    return;
  }

  // Buscar un usuario existente (preferiblemente admin)
  const user = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
    },
  });

  if (!user) {
    console.error("❌ No hay usuarios disponibles. Por favor crea un usuario primero.");
    return;
  }

  console.log(`✅ Producto encontrado: ${product.name} - $${product.price}`);
  console.log(`✅ Usuario encontrado: ${user.name} (${user.email})`);

  // Crear orden ficticia
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      email: user.email || "test@test.com",
      status: "PAID",
      totalAmount: product.price * 2, // Comprando 2 unidades
      shippingAddress: JSON.stringify({
        street: "Av. Corrientes 1234",
        city: "Buenos Aires",
        state: "CABA",
        zipCode: "C1043",
        country: "Argentina",
      }),
      billingAddress: JSON.stringify({
        street: "Av. Corrientes 1234",
        city: "Buenos Aires",
        state: "CABA",
        zipCode: "C1043",
        country: "Argentina",
      }),
      customerData: JSON.stringify({
        name: user.name,
        email: user.email,
        phone: "+54 9 11 1234-5678",
        documentType: "DNI",
        documentNumber: "12345678",
      }),
      items: {
        create: [
          {
            productId: product.id,
            quantity: 2,
            price: product.price,
          },
        ],
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  console.log("\n🎉 ¡Orden creada exitosamente!");
  console.log(`📦 ID de la orden: ${order.id}`);
  console.log(`💰 Total: $${order.totalAmount}`);
  console.log(`📊 Estado: ${order.status}`);
  console.log(`📅 Fecha: ${order.createdAt.toLocaleString("es-AR")}`);
  console.log(`\n🔗 Ver en admin: https://woky-two.vercel.app/admin/ordenes/${order.id}`);
  console.log(`🔗 Ver en local: http://localhost:3000/admin/ordenes/${order.id}`);
}

main()
  .catch((e) => {
    console.error("❌ Error creando orden:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
