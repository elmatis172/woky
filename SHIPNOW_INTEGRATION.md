# 🚀 Integración ShipNow

## 📋 Descripción

ShipNow es un agregador de servicios de envío que permite acceder a múltiples carriers (Andreani, Correo Argentino, OCA, etc.) a través de una única API.

**API Base URL**: `https://api.shipnow.com.ar/` (v1.0)

Documentación oficial: https://shipnow.stoplight.io/docs/shipnow-api

## 🔑 Configuración

### Variables de Entorno

Agregar en `.env.local`:

```bash
# ShipNow API
SHIPNOW_API_KEY=tu-api-key-de-shipnow

# Datos de tu tienda (origen de envíos)
STORE_NAME="Woky Kids Store"
STORE_EMAIL="tienda@woky.com"
STORE_PHONE="+54 11 1234-5678"
STORE_STREET="Av. Corrientes"
STORE_NUMBER="1234"
STORE_FLOOR=""
STORE_APARTMENT=""
STORE_CITY="CABA"
STORE_PROVINCE="Buenos Aires"
STORE_ZIP_CODE="1414"
```

### Obtener API Key

1. Crear cuenta en ShipNow: https://shipnow.com.ar
2. Ir al panel de desarrolladores
3. Generar API Key
4. Copiar y pegar en `.env.local`

## 📦 Funcionalidades Implementadas

### 1. Cotización de Envíos

**Endpoint**: `/api/shipping/calculate`

Se integra automáticamente al calcular opciones de envío en el carrito.

**Proceso**:
1. Usuario completa datos de envío (CP, provincia)
2. Se calculan opciones de envío de:
   - Métodos locales (configurados en admin)
   - Mercado Envíos (a través de MP)
   - OCA (si está configurado)
   - **ShipNow** (múltiples carriers)

**Request Interno**:
```typescript
const quote = await getShipNowQuote({
  origin: {
    zipCode: "1414",
    city: "CABA",
    province: "Buenos Aires",
  },
  destination: {
    zipCode: "5000",
    city: "Córdoba",
    province: "Córdoba",
  },
  packages: [{
    weight: 1000, // gramos
    width: 30,    // cm
    height: 20,   // cm
    length: 40,   // cm
    declaredValue: 125000, // centavos ($1,250.00)
  }],
});
```

**Response**:
```json
{
  "success": true,
  "quotes": [
    {
      "serviceId": "andreani-standard",
      "serviceName": "Standard",
      "carrier": "Andreani",
      "price": 350000,
      "estimatedDeliveryDays": 3,
      "features": ["door-to-door", "tracking"]
    },
    {
      "serviceId": "correo-clasico",
      "serviceName": "Clásico",
      "carrier": "Correo Argentino",
      "price": 280000,
      "estimatedDeliveryDays": 5,
      "features": ["tracking"]
    }
  ]
}
```

### 2. Crear Envío

**Endpoint**: `POST /api/shipping/shipnow/create`

Se llama después de confirmar una orden (cuando el pago está aprobado).

**Request**:
```json
{
  "orderId": "cm3abc123..."
}
```

**Proceso Automático**:
1. Verifica que la orden esté PAID
2. Extrae datos del cliente y dirección
3. Verifica que el método de envío sea ShipNow
4. Calcula peso y dimensiones del paquete
5. Crea el envío con ShipNow
6. Guarda tracking number en la orden

**Response**:
```json
{
  "success": true,
  "shipment": {
    "id": "shipnow-123456",
    "trackingNumber": "AN1234567890",
    "carrier": "Andreani",
    "serviceName": "Standard",
    "labelUrl": "https://shipnow.com/labels/123456.pdf",
    "estimatedDelivery": "2025-11-15",
    "status": "created"
  },
  "order": {
    "id": "cm3abc123...",
    "trackingNumber": "AN1234567890"
  }
}
```

### 3. Tracking de Envío

**Endpoint**: `GET /api/shipping/shipnow/track?trackingNumber=AN1234567890`

**Response**:
```json
{
  "success": true,
  "tracking": {
    "trackingNumber": "AN1234567890",
    "carrier": "Andreani",
    "status": "in_transit",
    "statusDescription": "En camino a destino",
    "estimatedDelivery": "2025-11-15",
    "events": [
      {
        "date": "2025-11-13T10:00:00Z",
        "location": "Centro de Distribución CABA",
        "description": "Paquete recibido en centro de distribución",
        "status": "received"
      },
      {
        "date": "2025-11-13T15:30:00Z",
        "location": "En tránsito",
        "description": "Paquete en camino a Córdoba",
        "status": "in_transit"
      }
    ]
  }
}
```

## 🔄 Flujo Completo

### Checkout con ShipNow

```
1. Usuario agrega productos al carrito
   └─> Carrito page: /carrito

2. Usuario completa datos de envío
   ├─> Ingresa CP y provincia
   └─> Click en "Calcular envío"

3. Se calculan opciones (incluye ShipNow)
   └─> POST /api/shipping/calculate
       ├─> Métodos locales
       ├─> Mercado Envíos
       ├─> OCA
       └─> ShipNow (múltiples carriers)

4. Usuario selecciona opción de ShipNow
   └─> Ej: "Andreani - Standard - $3,500 (3 días)"

5. Usuario completa checkout
   └─> POST /api/mp
       ├─> Crea orden (status: PENDING)
       ├─> Guarda shippingMethodId: "shipnow-andreani-standard"
       └─> Redirige a Mercado Pago

6. Usuario paga en MP
   └─> Webhook: POST /api/mp-webhook
       └─> Actualiza orden (status: PAID)

7. Crear envío con ShipNow (manual o automático)
   └─> POST /api/shipping/shipnow/create
       ├─> Crea envío en ShipNow
       ├─> Obtiene tracking number
       ├─> Guarda en orden.shippingData
       └─> Genera etiqueta de envío

8. Cliente puede trackear su pedido
   └─> GET /api/shipping/shipnow/track?trackingNumber=XXX
```

## 🛠️ Helpers Útiles

### Calcular Peso Volumétrico

```typescript
import { calculateVolumetricWeight, getBillableWeight } from "@/lib/shipnow";

// Peso volumétrico = (largo × ancho × alto) / 5000
const volWeight = calculateVolumetricWeight(30, 20, 40); // = 4800g

// Peso a facturar (mayor entre real y volumétrico)
const billable = getBillableWeight(1000, 30, 20, 40); // = 4800g
```

### Formatear Tracking Status

```typescript
const statusMap = {
  created: "Creado",
  picked_up: "Retirado",
  in_transit: "En tránsito",
  out_for_delivery: "En reparto",
  delivered: "Entregado",
  failed: "Fallido",
  returned: "Devuelto",
};

const friendlyStatus = statusMap[tracking.status] || tracking.status;
```

## 🎨 Mostrar Opciones en UI

### En Carrito (app/(store)/carrito/page.tsx)

Las opciones de ShipNow se muestran automáticamente junto con otras opciones:

```tsx
{shippingOptions.map((option) => (
  <label
    key={option.id}
    className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer ${
      selectedShipping?.id === option.id
        ? "border-primary bg-primary/5"
        : "border-gray-200 hover:border-gray-300"
    }`}
  >
    <div className="flex items-center gap-3">
      <input
        type="radio"
        name="shipping"
        value={option.id}
        checked={selectedShipping?.id === option.id}
        onChange={() => setSelectedShipping(option)}
        className="h-4 w-4"
      />
      <div>
        <p className="font-medium">{option.name}</p>
        {option.estimatedDays && (
          <p className="text-xs text-muted-foreground">
            {option.estimatedDays}
          </p>
        )}
        {/* Badge para identificar ShipNow */}
        {option.type === "SHIPNOW" && (
          <span className="text-xs text-blue-600">
            🚀 Via ShipNow
          </span>
        )}
      </div>
    </div>
    <p className="font-semibold">
      {option.cost === 0 ? "GRATIS" : formatPrice(option.cost)}
    </p>
  </label>
))}
```

## 📊 Panel de Administración

### Ver Envíos de ShipNow

En el panel de órdenes (`/admin/ordenes`), mostrar tracking info:

```tsx
{order.shippingData && (
  <div className="mt-2 p-3 bg-gray-50 rounded">
    <p className="text-sm font-medium">Información de Envío</p>
    <p className="text-sm">
      Carrier: {shippingData.carrier}
    </p>
    <p className="text-sm">
      Tracking: {shippingData.trackingNumber}
    </p>
    {shippingData.labelUrl && (
      <a
        href={shippingData.labelUrl}
        target="_blank"
        className="text-sm text-blue-600 hover:underline"
      >
        Descargar etiqueta
      </a>
    )}
  </div>
)}
```

### Botón para Crear Envío

```tsx
<Button
  onClick={async () => {
    const res = await fetch("/api/shipping/shipnow/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    });
    
    const data = await res.json();
    
    if (data.success) {
      alert(`Envío creado! Tracking: ${data.shipment.trackingNumber}`);
      // Recargar orden
    } else {
      alert(`Error: ${data.error}`);
    }
  }}
  disabled={order.status !== "PAID"}
>
  Crear Envío con ShipNow
</Button>
```

## 🧪 Testing

### Test con Postman/Thunder Client

**1. Cotizar Envío**:
```
POST http://localhost:3000/api/shipping/calculate
Content-Type: application/json

{
  "zipCode": "5000",
  "province": "Córdoba",
  "items": [
    {
      "productId": "cm3...",
      "quantity": 1,
      "price": 125000
    }
  ]
}
```

**2. Crear Envío (requiere orden PAID)**:
```
POST http://localhost:3000/api/shipping/shipnow/create
Content-Type: application/json

{
  "orderId": "cm3abc123..."
}
```

**3. Trackear**:
```
GET http://localhost:3000/api/shipping/shipnow/track?trackingNumber=AN1234567890
```

## ⚠️ Errores Comunes

### "SHIPNOW_API_KEY no está configurada"

**Solución**: Agregar en `.env.local`:
```bash
SHIPNOW_API_KEY=tu-key-aqui
```

### "Método de envío no es ShipNow"

**Causa**: La orden no tiene un `shippingMethodId` que empiece con `shipnow-`.

**Solución**: Verificar que el usuario seleccionó una opción de ShipNow en el checkout.

### "Datos de envío incompletos"

**Causa**: La orden no tiene `customerData` o `shippingAddress`.

**Solución**: Verificar que el checkout guarde correctamente estos datos.

### "Error 401 Unauthorized"

**Causa**: API Key inválida o expirada.

**Solución**: Verificar API Key en el panel de ShipNow.

## 🚀 Próximos Pasos

### Webhook de ShipNow

Configurar webhook para recibir actualizaciones de tracking:

```typescript
// app/api/shipping/shipnow/webhook/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Validar firma de ShipNow
  // Actualizar orden según evento
  
  if (body.event === "shipment.delivered") {
    await db.order.update({
      where: { 
        shippingData: { 
          path: ["trackingNumber"],
          equals: body.trackingNumber
        }
      },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
    });
  }
}
```

### Auto-crear Envío

En el webhook de MP, después de confirmar pago:

```typescript
// En /api/mp-webhook/route.ts
if (order.status === "PAID") {
  // Auto-crear envío si es ShipNow
  const shippingMethodId = order.customerData?.shippingMethodId;
  
  if (shippingMethodId?.startsWith("shipnow-")) {
    await fetch(`${process.env.NEXTAUTH_URL}/api/shipping/shipnow/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    });
  }
}
```

## 📚 Recursos

- **Documentación ShipNow**: https://shipnow.stoplight.io/docs/shipnow-api
- **Panel ShipNow**: https://app.shipnow.com.ar
- **Soporte**: soporte@shipnow.com.ar

---

**✅ Integración Completa!** ShipNow está listo para cotizar y crear envíos con múltiples carriers.
