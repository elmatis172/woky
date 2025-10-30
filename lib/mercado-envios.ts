import { env } from "@/lib/env";

interface ShippingCalculation {
  zip_code: string; // CP destino
  item: {
    id: string;
    quantity: number;
    dimensions: string; // "LxWxH"
    weight: number; // en gramos
  };
}

interface MercadoEnviosOption {
  id: number;
  name: string;
  cost: number;
  estimated_delivery_time: {
    type: string;
    date: string;
  };
  shipping_method_id: number;
}

interface MercadoEnviosResponse {
  options: MercadoEnviosOption[];
}

/**
 * Calcula opciones de envío usando Mercado Envíos
 * @param zipCode - Código postal del destinatario
 * @param items - Productos con dimensiones y peso
 * @returns Array de opciones de envío con costo
 */
export async function calculateMercadoEnvios(
  zipCode: string,
  items: Array<{
    id: string;
    quantity: number;
    weight?: number | null; // en gramos
    width?: number | null; // en cm
    height?: number | null; // en cm
    length?: number | null; // en cm
  }>
): Promise<MercadoEnviosOption[]> {
  try {
    const accessToken = env.MP_ACCESS_TOKEN;

    // Validar que el token esté configurado
    if (!accessToken || accessToken === "your-mercadopago-access-token-here") {
      console.warn("⚠️ MP_ACCESS_TOKEN no configurado - Mercado Envíos no disponible");
      return [];
    }

    console.log("🔍 Items recibidos para calcular ME:", JSON.stringify(items, null, 2));

    // Filtrar items que tienen todas las dimensiones necesarias
    const validItems = items.filter(
      (item) =>
        item.weight && item.width && item.height && item.length
    );

    console.log(`✅ Items válidos (con dimensiones completas): ${validItems.length}/${items.length}`);
    console.log("📦 Items válidos:", JSON.stringify(validItems, null, 2));

    if (validItems.length === 0) {
      console.warn("⚠️ No hay productos con dimensiones completas para calcular envío");
      return [];
    }

    // Calcular dimensiones totales (suma de todos los productos)
    const totalWeight = validItems.reduce(
      (sum, item) => sum + (item.weight || 0) * item.quantity,
      0
    );

    // Para dimensiones, tomamos el paquete más grande (simplificado)
    const maxWidth = Math.max(...validItems.map((i) => i.width || 0));
    const maxHeight = Math.max(...validItems.map((i) => i.height || 0));
    const maxLength = Math.max(...validItems.map((i) => i.length || 0));

    const dimensions = `${maxLength}x${maxWidth}x${maxHeight}`;

    console.log("📦 Datos enviados a Mercado Envíos:");
    console.log(`   - CP: ${zipCode}`);
    console.log(`   - Peso: ${totalWeight}g`);
    console.log(`   - Dimensiones: ${dimensions} cm`);

    // Llamar a la API de Mercado Envíos
    const response = await fetch(
      "https://api.mercadolibre.com/sites/MLA/shipping_options",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          zip_code: zipCode,
          item: {
            id: "package",
            quantity: 1,
            dimensions,
            weight: totalWeight,
          },
        } as ShippingCalculation),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Error calculando envío desde Mercado Libre:", error);
      return [];
    }

    const data: MercadoEnviosResponse = await response.json();
    console.log(`✅ Mercado Envíos devolvió ${data.options?.length || 0} opciones`);
    
    return data.options || [];
  } catch (error) {
    console.error("❌ Error en calculateMercadoEnvios:", error);
    return [];
  }
}

/**
 * Combina métodos de envío locales con opciones de Mercado Envíos
 */
export async function getAvailableShippingOptions(params: {
  zipCode: string;
  province: string;
  cartTotal: number; // En centavos
  items: Array<{
    id: string;
    quantity: number;
    weight?: number | null;
    width?: number | null;
    height?: number | null;
    length?: number | null;
  }>;
  localMethods: Array<{
    id: string;
    name: string;
    type: string;
    cost: number;
    estimatedDays: string | null;
    provinces: string | null;
    minAmount: number | null;
    maxAmount: number | null;
  }>;
}) {
  const { zipCode, province, cartTotal, items, localMethods } = params;

  console.log("🚚 Calculando opciones de envío...");
  console.log(`   - Provincia: ${province}`);
  console.log(`   - CP: ${zipCode}`);
  console.log(`   - Total carrito: $${cartTotal / 100}`);
  console.log(`   - Productos: ${items.length}`);

  // Filtrar métodos locales que aplican
  const validLocalMethods = localMethods.filter((method) => {
    // Verificar monto mínimo
    if (method.minAmount && cartTotal < method.minAmount) return false;

    // Verificar monto máximo
    if (method.maxAmount && cartTotal > method.maxAmount) return false;

    // Verificar provincia
    if (method.provinces) {
      const provinces = JSON.parse(method.provinces) as string[];
      if (!provinces.includes(province)) return false;
    }

    return true;
  });

  console.log(`✅ Métodos locales válidos: ${validLocalMethods.length}/${localMethods.length}`);

  // Obtener opciones de Mercado Envíos (solo para envíos a domicilio)
  const mercadoEnviosOptions = await calculateMercadoEnvios(zipCode, items);

  // Formatear opciones de Mercado Envíos
  const formattedMercadoEnvios = mercadoEnviosOptions.map((option) => ({
    id: `mercadoenvios-${option.id}`,
    name: option.name,
    type: "MERCADOENVIOS",
    cost: Math.round(option.cost * 100), // Convertir a centavos
    estimatedDays: option.estimated_delivery_time.date,
    isMercadoEnvios: true,
    mercadoEnviosId: option.shipping_method_id,
  }));

  console.log(`✅ Opciones de Mercado Envíos: ${formattedMercadoEnvios.length}`);

  // Combinar ambos
  return {
    local: validLocalMethods.map((m) => ({
      ...m,
      isMercadoEnvios: false,
    })),
    mercadoEnvios: formattedMercadoEnvios,
    all: [
      ...validLocalMethods.map((m) => ({ ...m, isMercadoEnvios: false })),
      ...formattedMercadoEnvios,
    ],
  };
}
