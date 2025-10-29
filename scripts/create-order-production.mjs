// Script para crear una orden de prueba en producción
// Ejecutar: node scripts/create-order-production.mjs

const BASE_URL = "https://woky-two.vercel.app";

async function createTestOrder() {
  console.log("🔍 Obteniendo productos disponibles...");

  // 1. Obtener productos
  const productsRes = await fetch(`${BASE_URL}/api/products`);
  const products = await productsRes.json();

  if (!products || products.length === 0) {
    console.error("❌ No hay productos disponibles");
    return;
  }

  const product = products[0];
  console.log(`✅ Producto encontrado: ${product.name} - $${product.price}`);

  // 2. Crear orden de prueba
  const orderData = {
    items: [
      {
        productId: product.id,
        quantity: 2,
        price: product.price,
      },
    ],
    totalAmount: product.price * 2,
    email: "test@woky.com",
    shippingAddress: {
      street: "Av. Corrientes 1234",
      city: "Buenos Aires",
      state: "CABA",
      zipCode: "C1043",
      country: "Argentina",
    },
    billingAddress: {
      street: "Av. Corrientes 1234",
      city: "Buenos Aires",
      state: "CABA",
      zipCode: "C1043",
      country: "Argentina",
    },
    customerData: {
      name: "Cliente de Prueba",
      email: "test@woky.com",
      phone: "+54 9 11 1234-5678",
      documentType: "DNI",
      documentNumber: "12345678",
    },
  };

  console.log("\n📦 Creando orden de prueba...");
  console.log("Datos:", JSON.stringify(orderData, null, 2));

  try {
    const createRes = await fetch(`${BASE_URL}/api/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!createRes.ok) {
      const errorText = await createRes.text();
      console.error("❌ Error al crear orden:", createRes.status, errorText);
      return;
    }

    const result = await createRes.json();
    console.log("\n✅ Respuesta recibida:");
    console.log(result);

    if (result.orderId) {
      console.log(`\n🎉 ¡Orden creada exitosamente!`);
      console.log(`📦 ID de la orden: ${result.orderId}`);
      console.log(`🔗 Ver en admin: ${BASE_URL}/admin/ordenes/${result.orderId}`);
      console.log(`🖨️  Imprimir: ${BASE_URL}/admin/ordenes/${result.orderId}/print`);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

createTestOrder().catch(console.error);
