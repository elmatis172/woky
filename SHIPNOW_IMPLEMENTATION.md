# 📘 Documentación Técnica: Implementación ShipNow

## 🎯 Objetivo

Integrar ShipNow como agregador de envíos para acceder a múltiples carriers (OCA, Andreani, Correo Argentino) a través de una única API, reemplazando la integración directa de OCA que presentaba problemas de precios.

---

## 🔧 Configuración Inicial

### API Key
```
Token: Ioolml7ZaDTHZ53MCVjUEZbJa6sIPru6dDe7g8iuCMyhHtXfJw
```

### Variable de Entorno
```bash
# .env.local
SHIPNOW_API_KEY=Ioolml7ZaDTHZ53MCVjUEZbJa6sIPru6dDe7g8iuCMyhHtXfJw
```

### API Base URL
```
https://api.shipnow.com.ar/
```

---

## 📁 Archivos Creados/Modificados

### 1. **lib/shipnow.ts** (NUEVO - 340 líneas)

**Propósito**: Wrapper completo de la API de ShipNow

**Funciones principales**:

#### `getShipNowQuote()`
- **Método**: GET `/shipping_options`
- **Parámetros**:
  - `to_zip_code`: Código postal destino (string)
  - `weight`: Peso total en gramos (number)
  - `types`: Tipos de envío - "ship_pap,ship_pas" (puerta a puerta, puerta a sucursal)
  - `categories`: Categorías - "economic" (estándar)
  - `mode`: Modo - "delivery" (entregas)
- **Respuesta**: Array de cotizaciones con carrier, servicio, precios e IVA
- **Conversión**: `tax_price` (precio con IVA) se multiplica x100 para centavos

#### `createShipNowShipment()`
- **Método**: POST `/shipments`
- **Propósito**: Crear etiqueta de envío después del pago
- **Retorna**: shipmentId, trackingNumber, labelUrl (PDF)

#### `trackShipNowShipment()`
- **Método**: GET `/shipments/{trackingNumber}/tracking`
- **Propósito**: Consultar estado del envío

**Tipos TypeScript definidos**:
```typescript
interface ShipNowQuoteRequest {
  to_zip_code: string;
  weight: number;
  types: string;
  categories: string;
  mode: string;
}

interface ShipNowQuoteResponse {
  success: boolean;
  quotes: ShipNowQuote[];
  error?: string;
}

interface ShipNowQuote {
  serviceId: string;
  carrier: string;
  serviceName: string;
  price: number;          // Precio sin IVA (centavos)
  tax_price: number;      // Precio con IVA (centavos)
  minimum_delivery: string;
  maximum_delivery: string;
  estimatedDeliveryDays: number;
}
```

---

### 2. **app/api/shipping/calculate/route.ts** (MODIFICADO)

**Cambios realizados**:

#### Línea 5: Import
```typescript
import { getShipNowQuote } from "@/lib/shipnow";
```

#### Líneas 95-113: Integración OCA Deshabilitada
```typescript
// ShipNow ya incluye OCA en sus opciones
// const ocaOptions = await getOCAShippingOptions(itemsWithDimensions, zipCode);
// options.oca = ocaOptions;
// if (ocaOptions.length > 0) {
//   options.all = [...options.all, ...ocaOptions];
//   console.log(`📦 Opciones OCA: ${ocaOptions.length}`);
// }
```

**Razón**: ShipNow ya retorna opciones de OCA en su agregación, no necesitamos llamar directamente a OCA.

#### Líneas 118-168: Integración ShipNow + Deduplicación

```typescript
// Calcular peso total del paquete
const totalWeight = itemsWithDimensions.reduce(
  (sum: number, item: any) => sum + (item.weight || 0) * item.quantity,
  0
);

const shipNowResponse = await getShipNowQuote({
  to_zip_code: zipCode,
  weight: totalWeight || 500,
  types: "ship_pap,ship_pas",
  categories: "economic",
  mode: "delivery",
});

if (shipNowResponse.success && shipNowResponse.quotes.length > 0) {
  shipNowOptions = shipNowResponse.quotes.map((quote) => ({
    id: quote.serviceId,
    name: `${quote.carrier} - ${quote.serviceName}`,
    type: "SHIPNOW",
    cost: quote.tax_price, // Precio CON IVA
    estimatedDays: quote.estimatedDeliveryDays 
      ? `Entrega en ${quote.estimatedDeliveryDays} días`
      : quote.minimum_delivery && quote.maximum_delivery
      ? `Entre ${new Date(quote.minimum_delivery).toLocaleDateString()} y ${new Date(quote.maximum_delivery).toLocaleDateString()}`
      : null,
    isShipNow: true,
    shipNowServiceId: quote.serviceId,
    carrier: quote.carrier,
  }));

  // ⚠️ DEDUPLICACIÓN - Eliminar opciones duplicadas por nombre + costo
  const uniqueOptions = shipNowOptions.reduce((acc: ShippingOption[], option) => {
    const exists = acc.find(
      (o) => o.name === option.name && o.cost === option.cost
    );
    if (!exists) {
      acc.push(option);
    }
    return acc;
  }, []);

  shipNowOptions = uniqueOptions;
}

options.shipNow = shipNowOptions;
options.all = [...options.all, ...shipNowOptions];
```

**Problema resuelto**: ShipNow API retornaba 3 opciones idénticas de "OCA - Envío" a $9,836 cada una. La deduplicación por `name + cost` elimina duplicados.

---

### 3. **app/api/shipping/shipnow/create/route.ts** (NUEVO - 186 líneas)

**Propósito**: Crear etiqueta de envío después del pago

**Endpoint**: `POST /api/shipping/shipnow/create`

**Body esperado**:
```json
{
  "orderId": "clxxxxx",
  "serviceId": "shipnow-service-id",
  "carrier": "oca"
}
```

**Fixes aplicados**:

#### Fix 1: Manejo de item sin dimensiones (Líneas 78-90)
```typescript
const largestItem = itemsWithDimensions.reduce(
  (largest: any, item: any) =>
    !largest || (item.width || 0) * (item.height || 0) * (item.length || 0) >
      (largest.width || 0) * (largest.height || 0) * (largest.length || 0)
      ? item
      : largest,
  null
);

// ⚠️ FIX: Valores por defecto si no hay dimensiones
const packageDimensions = {
  width: largestItem?.width || 20,
  height: largestItem?.height || 10,
  length: largestItem?.length || 30,
};
```

**Problema**: TypeScript error "largestItem is possibly null"

#### Fix 2: Uso de customerData (Líneas 145-164)
```typescript
// Parsear customerData existente
const existingData = order.customerData
  ? JSON.parse(order.customerData)
  : {};

// ⚠️ FIX: Usar customerData.shipNowData en lugar de shippingData (campo inexistente)
const updatedOrder = await prisma.order.update({
  where: { id: orderId },
  data: {
    customerData: JSON.stringify({
      ...existingData,
      shipNowData: {
        provider: "shipnow",
        shipmentId: shipment.shipmentId,
        trackingNumber: shipment.trackingNumber,
        carrier: shipment.carrier,
        labelUrl: shipment.labelUrl,
        status: shipment.status,
        createdAt: new Date().toISOString(),
      },
    }),
  },
});
```

**Problema**: Campo `shippingData` no existe en schema de Prisma. Se usa `customerData` (JSON string) con nested object `shipNowData`.

---

### 4. **app/api/shipping/shipnow/track/route.ts** (NUEVO)

**Propósito**: Consultar estado de envío

**Endpoint**: `GET /api/shipping/shipnow/track?trackingNumber=xxx`

---

## 🐛 Problemas Encontrados y Soluciones

### Problema 1: Type Error - estimatedDays undefined
**Error**: 
```
Type 'undefined' is not assignable to type 'string | null'
```

**Solución** (Commit a55c1bd):
```typescript
// Antes
estimatedDays: quote.estimatedDeliveryDays 
  ? `Entrega en ${quote.estimatedDeliveryDays} días`
  : undefined,  // ❌ TypeScript no permite undefined

// Después
estimatedDays: quote.estimatedDeliveryDays 
  ? `Entrega en ${quote.estimatedDeliveryDays} días`
  : null,  // ✅ null es válido
```

---

### Problema 2: Null Check - largestItem
**Error**: 
```
Object is possibly 'null' - largestItem
```

**Solución** (Commit c7736e2):
```typescript
const packageDimensions = {
  width: largestItem?.width || 20,  // Valores por defecto
  height: largestItem?.height || 10,
  length: largestItem?.length || 30,
};
```

---

### Problema 3: Campo Inexistente - shippingData
**Error**: 
```
Property 'shippingData' does not exist in type 'OrderUpdateInput'
```

**Schema Prisma**:
```prisma
model Order {
  customerData  String?  // ✅ Campo JSON para datos del cliente
  shippingData  String?  // ❌ NO EXISTE
}
```

**Solución** (Commit d9aadac):
```typescript
// Parsear data existente
const existingData = order.customerData ? JSON.parse(order.customerData) : {};

// Agregar shipNowData como nested object
customerData: JSON.stringify({
  ...existingData,
  shipNowData: { /* ... */ }
})
```

---

### Problema 4: Duplicados de OCA (3 veces)
**Causa**: 
- ShipNow API retorna múltiples opciones idénticas del mismo carrier
- Respuesta real: `[{OCA $9,836}, {OCA $9,836}, {OCA $9,836}]`

**Primer intento** (Commit 71e7aaf): Deshabilitar integración directa OCA
```typescript
// Comentar llamada directa a OCA
// const ocaOptions = await getOCAShippingOptions(...);
```

**Resultado**: Seguían apareciendo 3 OCA (venían de ShipNow mismo)

**Solución final** (Commit 42c971d): Deduplicación client-side
```typescript
const uniqueOptions = shipNowOptions.reduce((acc: ShippingOption[], option) => {
  const exists = acc.find(
    (o) => o.name === option.name && o.cost === option.cost
  );
  if (!exists) {
    acc.push(option);
  }
  return acc;
}, []);

shipNowOptions = uniqueOptions;
```

**Criterio**: Filtrar por combinación `name + cost` única
**Resultado**: 3 OCA idénticas → 1 OCA

---

## 📊 Test Realizado

### Request de Prueba
```typescript
{
  to_zip_code: "5000",      // Córdoba
  weight: 1000,             // 1 kg
  types: "ship_pap,ship_pas",
  categories: "economic",
  mode: "delivery"
}
```

### Response (Antes de deduplicación)
```json
{
  "success": true,
  "quotes": [
    {
      "carrier": "shipnow",
      "serviceName": "Envío",
      "price": 8686,
      "tax_price": 10330,  // Con IVA
      "estimatedDeliveryDays": 1
    },
    {
      "carrier": "oca",
      "serviceName": "Envío",
      "price": 8277,
      "tax_price": 9836,
      "estimatedDeliveryDays": 2
    },
    {
      "carrier": "oca",  // ❌ DUPLICADO
      "serviceName": "Envío",
      "price": 8277,
      "tax_price": 9836,
      "estimatedDeliveryDays": 2
    },
    {
      "carrier": "oca",  // ❌ DUPLICADO
      "serviceName": "Envío",
      "price": 8277,
      "tax_price": 9836,
      "estimatedDeliveryDays": 2
    }
  ]
}
```

### Response (Después de deduplicación)
```json
{
  "local": [...],
  "shipNow": [
    {
      "name": "shipnow - Envío",
      "cost": 10330,  // $103.30
      "estimatedDays": "Entrega en 1 días"
    },
    {
      "name": "oca - Envío",  // ✅ SOLO 1
      "cost": 9836,  // $98.36
      "estimatedDays": "Entrega en 2 días"
    }
  ],
  "all": [...]
}
```

---

## 📦 Commits Realizados

### 1. `dffb62a` - Initial ShipNow Integration
- Creación de `lib/shipnow.ts` (340 líneas)
- Integración en `calculate/route.ts`
- Endpoints create + track
- +1,278 insertions

### 2. `377f9c0` - Vercel Deploy Guide
- Documentación de deployment

### 3. `a55c1bd` - Fix estimatedDays Type
- Cambio `undefined` → `null`

### 4. `c7736e2` - Fix Largest Item Null Check
- Valores por defecto para dimensiones

### 5. `d9aadac` - Fix customerData Field
- Usar `customerData.shipNowData` en lugar de `shippingData`

### 6. `71e7aaf` - Disable OCA Direct Integration
- Comentar llamada directa a OCA (ShipNow ya lo incluye)

### 7. `42c971d` - Remove Duplicate ShipNow Options
- **ACTUAL** - Deduplicación por `name + cost`
- Solución definitiva para 3x OCA duplicadas

---

## 🚀 Deployment

### Vercel - Auto Deploy
- **Método**: GitHub integration
- **Trigger**: Push a `main` branch
- **Status**: ✅ Todos los builds exitosos después de fixes
- **URL**: https://wokykids.com.ar

### Variables de Entorno en Vercel
```bash
SHIPNOW_API_KEY=Ioolml7ZaDTHZ53MCVjUEZbJa6sIPru6dDe7g8iuCMyhHtXfJw
```

---

## ✅ Resultado Final Esperado

### Opciones de Envío (UI)
Para un pedido CABA → Córdoba (1kg):

1. **ENVIOS AMBA** - $25,000
   - Método local, solo AMBA

2. **shipnow - Envío** - $10,330
   - Entrega en 1 día
   - Carrier agregador ShipNow

3. **OCA - Envío** - $9,836  ✅ SOLO 1 (no 3)
   - Entrega en 2 días
   - A través de ShipNow

**Total: 3 opciones** (antes eran 5 con duplicados)

---

## 🔍 Troubleshooting

### Si aparecen duplicados nuevamente:

1. **Verificar logs del servidor**:
```bash
# Buscar en consola:
🚀 Opciones ShipNow (únicas): 2
```

2. **Check deduplicación**:
```typescript
// En calculate/route.ts líneas 154-165
console.log("Antes dedup:", shipNowOptions.length);
console.log("Después dedup:", uniqueOptions.length);
```

3. **Alternativa de deduplicación**:
Si `name + cost` no es suficiente, usar también `carrier`:
```typescript
const exists = acc.find(
  (o) => o.name === option.name && 
         o.cost === option.cost && 
         o.carrier === option.carrier
);
```

---

## 📋 Checklist de Recuperación

Si el sistema se crashea, seguir estos pasos:

- [ ] Verificar `.env.local` tiene `SHIPNOW_API_KEY`
- [ ] Verificar Vercel tiene la variable de entorno configurada
- [ ] Revisar que `lib/shipnow.ts` existe (340 líneas)
- [ ] Revisar integración en `calculate/route.ts` (líneas 118-168)
- [ ] Confirmar OCA directa está comentada (líneas 95-113)
- [ ] Verificar deduplicación activa (líneas 154-165)
- [ ] Revisar endpoints create/track existen
- [ ] Test manual: http://localhost:3000/api/shipping/calculate

---

## 📚 Documentación Adicional

- `SHIPNOW_INTEGRATION.md` - Guía de integración completa
- `SHIPNOW_COMPLETADO.md` - Checklist de implementación
- API Docs: https://shipnow.stoplight.io/docs/shipnow-api

---

**Última actualización**: 12 de noviembre 2025  
**Versión**: 1.0 (Producción)  
**Status**: ✅ Operativo con deduplicación
