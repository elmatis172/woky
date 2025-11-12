/**
 * ShipNow API Integration
 * Documentación: https://shipnow.stoplight.io/docs/shipnow-api
 * API Base URL: https://api.shipnow.com.ar/
 */

// Base URL de la API de ShipNow (Producción)
const SHIPNOW_API_URL = "https://api.shipnow.com.ar";

// Tipos
export interface ShipNowQuoteRequest {
  to_zip_code?: string; // Para envíos
  from_zip_code?: string; // Para devoluciones
  weight: number; // en gramos
  types: string; // "ship_pap" (domicilio) o "ship_pas" (sucursal) o ambos "ship_pap,ship_pas"
  categories: string; // "economic" (estándar) o "super_express" (same day) o ambos
  mode: string; // "delivery" (entregas) o "exchange" (devoluciones)
}

export interface ShipNowQuoteResponse {
  success: boolean;
  quotes: Array<{
    serviceId: string;
    serviceName: string;
    carrier: string;
    price: number; // precio en centavos
    tax_price: number; // precio con IVA en centavos
    estimatedDeliveryDays?: number;
    minimum_delivery?: string;
    maximum_delivery?: string;
    ship_from_type: string;
    ship_to_type: string;
  }>;
  error?: string;
}

export interface ShipNowShipmentRequest {
  origin: {
    name: string;
    phone: string;
    email: string;
    address: {
      street: string;
      number: string;
      floor?: string;
      apartment?: string;
      city: string;
      province: string;
      zipCode: string;
      country: string;
    };
  };
  destination: {
    name: string;
    phone: string;
    email: string;
    address: {
      street: string;
      number: string;
      floor?: string;
      apartment?: string;
      city: string;
      province: string;
      zipCode: string;
      country: string;
    };
  };
  packages: Array<{
    weight: number;
    width: number;
    height: number;
    length: number;
    declaredValue: number;
    description?: string;
  }>;
  serviceId: string; // ID del servicio seleccionado en la cotización
  reference?: string; // Referencia externa (ej: order ID)
}

export interface ShipNowShipmentResponse {
  success: boolean;
  shipment?: {
    id: string;
    trackingNumber: string;
    carrier: string;
    serviceName: string;
    labelUrl?: string;
    estimatedDelivery?: string;
    status: string;
  };
  error?: string;
}

export interface ShipNowTrackingResponse {
  success: boolean;
  tracking?: {
    trackingNumber: string;
    carrier: string;
    status: string;
    statusDescription: string;
    estimatedDelivery?: string;
    deliveredAt?: string;
    events: Array<{
      date: string;
      location: string;
      description: string;
      status: string;
    }>;
  };
  error?: string;
}

/**
 * Headers comunes para todas las requests
 */
function getHeaders(): HeadersInit {
  const apiKey = process.env.SHIPNOW_API_KEY;
  
  if (!apiKey) {
    throw new Error("SHIPNOW_API_KEY no está configurada");
  }

  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
    "Accept": "application/json",
  };
}

/**
 * Cotizar envío con ShipNow
 */
export async function getShipNowQuote(
  request: ShipNowQuoteRequest
): Promise<ShipNowQuoteResponse> {
  try {
    console.log("ShipNow - Solicitando cotización:", JSON.stringify(request, null, 2));

    // Construir query params
    const params = new URLSearchParams({
      weight: request.weight.toString(),
      types: request.types,
      categories: request.categories,
      mode: request.mode,
    });

    // Agregar to_zip_code o from_zip_code según el modo
    if (request.mode === "delivery" && request.to_zip_code) {
      params.append("to_zip_code", request.to_zip_code);
    } else if (request.mode === "exchange" && request.from_zip_code) {
      params.append("from_zip_code", request.from_zip_code);
    }

    const response = await fetch(
      `${SHIPNOW_API_URL}/shipping_options?${params.toString()}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    const data = await response.json();
    console.log("ShipNow - Respuesta cotización:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      return {
        success: false,
        quotes: [],
        error: data.errors?.[0] || data.error || `Error ${response.status}`,
      };
    }

    // Transformar respuesta al formato esperado
    const quotes = (data.results || []).map((result: any) => {
      // Calcular días estimados de entrega
      let estimatedDeliveryDays: number | undefined;
      if (result.minimum_delivery && result.maximum_delivery) {
        const minDate = new Date(result.minimum_delivery);
        const today = new Date();
        estimatedDeliveryDays = Math.ceil(
          (minDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      return {
        serviceId: `shipnow-${result.shipping_service?.id || result.shipping_contract?.id}`,
        serviceName: result.shipping_service?.name || result.shipping_contract?.name || "Envío",
        carrier: result.shipping_service?.carrier?.name || "ShipNow",
        price: Math.round((result.price || 0) * 100), // Convertir a centavos
        tax_price: Math.round((result.tax_price || 0) * 100),
        estimatedDeliveryDays,
        minimum_delivery: result.minimum_delivery,
        maximum_delivery: result.maximum_delivery,
        ship_from_type: result.ship_from_type,
        ship_to_type: result.ship_to_type,
      };
    });

    return {
      success: true,
      quotes: quotes,
    };
  } catch (error) {
    console.error("ShipNow - Error cotización:", error);
    return {
      success: false,
      quotes: [],
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Crear envío con ShipNow
 */
export async function createShipNowShipment(
  request: ShipNowShipmentRequest
): Promise<ShipNowShipmentResponse> {
  try {
    console.log("ShipNow - Creando envío:", JSON.stringify(request, null, 2));

    const response = await fetch(`${SHIPNOW_API_URL}/shipments`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(request),
    });

    const data = await response.json();
    console.log("ShipNow - Respuesta creación:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Error ${response.status}: ${response.statusText}`,
      };
    }

    return {
      success: true,
      shipment: {
        id: data.id || data.shipmentId,
        trackingNumber: data.trackingNumber || data.tracking,
        carrier: data.carrier || data.provider,
        serviceName: data.serviceName || data.service,
        labelUrl: data.labelUrl || data.label,
        estimatedDelivery: data.estimatedDelivery,
        status: data.status || "created",
      },
    };
  } catch (error) {
    console.error("ShipNow - Error creación:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Trackear envío por número de tracking
 */
export async function trackShipNowShipment(
  trackingNumber: string
): Promise<ShipNowTrackingResponse> {
  try {
    console.log("ShipNow - Tracking:", trackingNumber);

    const response = await fetch(
      `${SHIPNOW_API_URL}/tracking/${encodeURIComponent(trackingNumber)}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    const data = await response.json();
    console.log("ShipNow - Respuesta tracking:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Error ${response.status}: ${response.statusText}`,
      };
    }

    return {
      success: true,
      tracking: {
        trackingNumber: data.trackingNumber || trackingNumber,
        carrier: data.carrier || data.provider,
        status: data.status,
        statusDescription: data.statusDescription || data.statusText,
        estimatedDelivery: data.estimatedDelivery,
        deliveredAt: data.deliveredAt,
        events: (data.events || []).map((event: any) => ({
          date: event.date || event.timestamp,
          location: event.location || event.city,
          description: event.description || event.message,
          status: event.status || event.state,
        })),
      },
    };
  } catch (error) {
    console.error("ShipNow - Error tracking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Cancelar envío
 */
export async function cancelShipNowShipment(
  shipmentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("ShipNow - Cancelando envío:", shipmentId);

    const response = await fetch(`${SHIPNOW_API_URL}/shipments/${shipmentId}/cancel`, {
      method: "POST",
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || `Error ${response.status}: ${response.statusText}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("ShipNow - Error cancelación:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Helper: Calcular peso volumétrico
 * Fórmula: (largo × ancho × alto) / 5000
 */
export function calculateVolumetricWeight(
  width: number,
  height: number,
  length: number
): number {
  return Math.ceil((width * height * length) / 5000);
}

/**
 * Helper: Determinar peso a usar (mayor entre real y volumétrico)
 */
export function getBillableWeight(
  actualWeight: number,
  width: number,
  height: number,
  length: number
): number {
  const volumetricWeight = calculateVolumetricWeight(width, height, length);
  return Math.max(actualWeight, volumetricWeight);
}
