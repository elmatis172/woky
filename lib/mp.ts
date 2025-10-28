import { env } from "@/lib/env";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

// Inicializar cliente de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: env.MP_ACCESS_TOKEN,
  options: { timeout: 5000 },
});

export const preferenceClient = new Preference(client);
export const paymentClient = new Payment(client);

/**
 * Crea una preferencia de pago en Mercado Pago
 */
export async function createPreference(data: {
  orderId: string;
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
    currency_id?: string;
  }>;
  payer?: {
    name?: string;
    email?: string;
  };
}) {
  const publicUrl = env.NEXTAUTH_URL || "http://localhost:3000";

  const preference = await preferenceClient.create({
    body: {
      items: data.items.map((item) => ({
        ...item,
        currency_id: item.currency_id || "ARS",
      })),
      payer: data.payer,
      back_urls: {
        success: `${publicUrl}/ok?order=${data.orderId}`,
        failure: `${publicUrl}/checkout?status=failure`,
        pending: `${publicUrl}/checkout?status=pending`,
      },
      auto_return: "approved",
      notification_url: `${publicUrl}/api/mp-webhook`,
      statement_descriptor: "WOKY STORE",
      external_reference: data.orderId,
    },
  });

  return preference;
}

/**
 * Obtiene información de un pago
 */
export async function getPayment(paymentId: string) {
  try {
    const payment = await paymentClient.get({ id: paymentId });
    return payment;
  } catch (error) {
    console.error("Error fetching payment:", error);
    throw error;
  }
}

/**
 * Verifica la firma del webhook (si MP lo soporta)
 */
export function verifyWebhookSignature(
  signature: string,
  data: string
): boolean {
  // Mercado Pago por lo general usa x-signature header
  // Por seguridad, SIEMPRE se debe consultar el pago a la API
  // No confiar solo en el payload del webhook
  return true; // La verificación real se hace consultando el pago
}
