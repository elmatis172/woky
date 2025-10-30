import { db } from "../lib/db";

async function seedShippingMethods() {
  console.log("Seeding shipping methods...");

  // Envío estándar a todo el país
  await db.shippingMethod.upsert({
    where: { id: "standard-nacional" },
    update: {},
    create: {
      id: "standard-nacional",
      name: "Envío a Domicilio",
      description: "Envío estándar a todo el país",
      type: "STANDARD",
      cost: 150000, // $1500 en centavos
      estimatedDays: "3-5 días hábiles",
      isActive: true,
      provinces: null, // Aplica a todas las provincias
      minAmount: null,
      maxAmount: null,
    },
  });

  // Envío express (más rápido)
  await db.shippingMethod.upsert({
    where: { id: "express-nacional" },
    update: {},
    create: {
      id: "express-nacional",
      name: "Envío Express",
      description: "Envío rápido a todo el país",
      type: "EXPRESS",
      cost: 300000, // $3000 en centavos
      estimatedDays: "24-48 horas",
      isActive: true,
      provinces: null,
      minAmount: null,
      maxAmount: null,
    },
  });

  // Retiro en sucursal (gratis)
  await db.shippingMethod.upsert({
    where: { id: "pickup-store" },
    update: {},
    create: {
      id: "pickup-store",
      name: "Retiro en Sucursal",
      description: "Retirá tu pedido en nuestra sucursal",
      type: "PICKUP",
      cost: 0, // Gratis
      estimatedDays: "Disponible al día siguiente",
      isActive: true,
      provinces: null,
      minAmount: null,
      maxAmount: null,
    },
  });

  // Envío gratis para compras mayores
  await db.shippingMethod.upsert({
    where: { id: "free-shipping" },
    update: {},
    create: {
      id: "free-shipping",
      name: "Envío Gratis",
      description: "Envío gratis en compras mayores a $50.000",
      type: "FREE",
      cost: 0,
      estimatedDays: "3-5 días hábiles",
      isActive: true,
      provinces: null,
      minAmount: 5000000, // $50.000 en centavos
      maxAmount: null,
    },
  });

  console.log("✅ Shipping methods seeded successfully!");
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedShippingMethods()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error seeding shipping methods:", error);
      process.exit(1);
    });
}

export { seedShippingMethods };
