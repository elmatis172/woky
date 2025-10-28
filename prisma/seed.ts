import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Crear usuario admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@woky.com" },
    update: {},
    create: {
      email: "admin@woky.com",
      name: "Admin",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Crear usuario normal
  const userPassword = await bcrypt.hash("user123", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      email: "user@example.com",
      name: "Usuario Demo",
      password: userPassword,
      role: "USER",
      emailVerified: new Date(),
    },
  });
  console.log("✅ Regular user created:", user.email);

  // Crear categorías
  const categories = [
    {
      name: "Ropa de Niño",
      slug: "ropa-nino",
      description: "Ropa cómoda y moderna para niños",
      image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800",
    },
    {
      name: "Ropa de Niña",
      slug: "ropa-nina",
      description: "Moda linda y divertida para niñas",
      image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800",
    },
    {
      name: "Bebés",
      slug: "bebes",
      description: "Ropa suave y cómoda para bebés",
      image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800",
    },
    {
      name: "Accesorios",
      slug: "accesorios",
      description: "Gorros, bufandas, mochilas y más",
      image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800",
    },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Categories created");

  // Obtener IDs de categorías
  const nino = await prisma.category.findUnique({
    where: { slug: "ropa-nino" },
  });
  const nina = await prisma.category.findUnique({ where: { slug: "ropa-nina" } });
  const bebes = await prisma.category.findUnique({ where: { slug: "bebes" } });
  const accesorios = await prisma.category.findUnique({
    where: { slug: "accesorios" },
  });

  // Crear productos
  const products = [
    {
      name: "Conjunto Deportivo Niño",
      slug: "conjunto-deportivo-nino",
      description:
        "Conjunto deportivo de dos piezas en algodón premium. Remera + pantalón jogging con cintura elástica. Perfecto para jugar y estar cómodo.",
      sku: "NINO-CON-001",
      price: 15000, // $150.00 ARS
      compareAtPrice: 20000,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=800",
        "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800",
      ]),
      stock: 50,
      status: "PUBLISHED" as const,
      featured: true,
      categoryId: nino?.id,
      attributes: JSON.stringify({
        talla: ["2", "4", "6", "8", "10", "12"],
        color: ["Azul Marino", "Gris", "Negro"],
        material: "Algodón 100%",
      }),
    },
    {
      name: "Vestido Floreado Niña",
      slug: "vestido-floreado-nina",
      description:
        "Hermoso vestido con estampado floral, ideal para fiestas y ocasiones especiales. Tela suave y fresca, diseño con lazo en la cintura.",
      sku: "NINA-VES-002",
      price: 18000,
      compareAtPrice: 25000,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800",
        "https://images.unsplash.com/photo-1596555686299-21e2650c8904?w=800",
      ]),
      stock: 40,
      status: "PUBLISHED" as const,
      featured: true,
      categoryId: nina?.id,
      attributes: JSON.stringify({
        talla: ["2", "4", "6", "8", "10", "12"],
        color: ["Rosa", "Celeste", "Amarillo"],
        material: "Algodón y Poliéster",
      }),
    },
    {
      name: "Remera Estampada Niño",
      slug: "remera-estampada-nino",
      description:
        "Remera de algodón con divertidos estampados de dinosaurios. Cuello redondo y mangas cortas. Súper cómoda para el día a día.",
      sku: "NINO-REM-003",
      price: 8000,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800",
      ]),
      stock: 80,
      status: "PUBLISHED" as const,
      categoryId: nino?.id,
      attributes: JSON.stringify({
        talla: ["2", "4", "6", "8", "10"],
        color: ["Blanco", "Azul", "Verde"],
        estampado: "Dinosaurios",
      }),
    },
    {
      name: "Conjunto de Bebé Osito",
      slug: "conjunto-bebe-osito",
      description:
        "Adorable conjunto de 3 piezas para bebé: body, pantalón y gorro con orejas de osito. Algodón ultra suave, ideal para recién nacidos.",
      sku: "BEBE-CON-004",
      price: 12000,
      compareAtPrice: 16000,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800",
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
      ]),
      stock: 45,
      status: "PUBLISHED" as const,
      featured: true,
      categoryId: bebes?.id,
      attributes: JSON.stringify({
        talla: ["0-3m", "3-6m", "6-9m", "9-12m"],
        color: ["Beige", "Rosa", "Celeste"],
        material: "Algodón orgánico",
      }),
    },
    {
      name: "Jean Elastizado Niña",
      slug: "jean-elastizado-nina",
      description:
        "Jean con elastano para máxima comodidad y libertad de movimiento. Cintura ajustable, bolsillos funcionales y detalles bordados.",
      sku: "NINA-JEA-005",
      price: 16000,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=800",
      ]),
      stock: 60,
      status: "PUBLISHED" as const,
      categoryId: nina?.id,
      attributes: JSON.stringify({
        talla: ["4", "6", "8", "10", "12"],
        color: ["Azul Claro", "Azul Oscuro"],
        tipo: "Skinny Fit",
      }),
    },
    {
      name: "Campera Impermeable Niño",
      slug: "campera-impermeable-nino",
      description:
        "Campera con capucha removible, resistente al agua. Cierre frontal, bolsillos laterales y puños ajustables. Perfecta para días de lluvia.",
      sku: "NINO-CAM-006",
      price: 25000,
      compareAtPrice: 32000,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800",
      ]),
      stock: 35,
      status: "PUBLISHED" as const,
      featured: true,
      categoryId: nino?.id,
      attributes: JSON.stringify({
        talla: ["4", "6", "8", "10", "12"],
        color: ["Rojo", "Azul", "Verde"],
        tipo: "Impermeable",
      }),
    },
    {
      name: "Mochila Infantil Unicornio",
      slug: "mochila-infantil-unicornio",
      description:
        "Mochila adorable con diseño de unicornio en 3D. Tamaño perfecto para jardín y primaria. Correas ajustables y cierre con cremallera.",
      sku: "ACC-MOC-007",
      price: 9000,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
      ]),
      stock: 55,
      status: "PUBLISHED" as const,
      categoryId: accesorios?.id,
      attributes: JSON.stringify({
        tamaño: "30x25x10cm",
        color: ["Rosa", "Lila", "Multicolor"],
        edad: "3-8 años",
      }),
    },
    {
      name: "Pack Bodies Bebé x5",
      slug: "pack-bodies-bebe-x5",
      description:
        "Set de 5 bodies manga corta en colores surtidos. Cierre en entrepierna con broches. Algodón suave que cuida la piel del bebé.",
      sku: "BEBE-BOD-008",
      price: 14000,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1519689373023-dd07c7988603?w=800",
      ]),
      stock: 70,
      status: "PUBLISHED" as const,
      categoryId: bebes?.id,
      attributes: JSON.stringify({
        talla: ["0-3m", "3-6m", "6-9m", "9-12m"],
        colores: "Surtidos pastel",
        cantidad: "5 unidades",
      }),
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }
  console.log("✅ Products created");

  // Crear una orden de ejemplo
  const sampleProduct = await prisma.product.findUnique({
    where: { slug: "conjunto-deportivo-nino" },
  });

  if (sampleProduct) {
    const sampleImages = JSON.parse(sampleProduct.images);
    await prisma.order.create({
      data: {
        userId: user.id,
        email: user.email!,
        status: "PAID",
        currency: "ARS",
        subtotal: 45000,
        shipping: 5000,
        discount: 0,
        totalAmount: 50000,
        timeline: JSON.stringify([
          {
            status: "PENDING",
            timestamp: new Date().toISOString(),
            note: "Orden creada",
          },
          {
            status: "PAID",
            timestamp: new Date().toISOString(),
            note: "Pago aprobado",
          },
        ]),
        customerData: JSON.stringify({
          name: "Usuario Demo",
          phone: "+54911234567",
        }),
        items: {
          create: [
            {
              productId: sampleProduct.id,
              name: sampleProduct.name,
              sku: sampleProduct.sku,
              unitPrice: sampleProduct.price,
              quantity: 1,
              image: sampleImages[0] || "",
            },
          ],
        },
      },
    });
    console.log("✅ Sample order created");
  }

  console.log("✨ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
