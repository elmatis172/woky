# 📦 Configuración de Mercado Envíos - REQUERIDO

## ⚠️ IMPORTANTE: Mercado Envíos NO es automático

Tener Mercado Pago configurado **NO activa automáticamente Mercado Envíos**. Son dos servicios separados que requieren configuración independiente.

---

## 🔧 Paso 1: Activar Mercado Envíos en tu Cuenta

### 1. Ingresar al Panel de Mercado Pago
```
https://www.mercadopago.com.ar/
```

### 2. Ir a Configuración de Envíos
```
Menú → Configuración → Mercado Envíos
```
O directamente:
```
https://www.mercadopago.com.ar/shipping/configuration
```

### 3. Activar el Servicio
- Hacer clic en **"Activar Mercado Envíos"**
- Leer y aceptar los **Términos y Condiciones**

---

## 📍 Paso 2: Configurar Dirección de Origen

Debes indicar desde dónde envías los productos:

### Datos Requeridos:
- ✅ **Calle:** Nombre completo (ej: "Av. Corrientes")
- ✅ **Número:** Número de domicilio (ej: "1234")
- ✅ **Piso/Depto:** Opcional
- ✅ **Código Postal:** Exacto (ej: "1043")
- ✅ **Ciudad:** Localidad
- ✅ **Provincia:** Provincia de Argentina

### ⚠️ Importante:
- La dirección debe ser **real y verificable**
- Mercado Libre puede validar tu dirección
- Debe coincidir con tu ubicación física de despacho

---

## 🔐 Paso 3: Verificar Permisos del Access Token

Tu Access Token debe tener los permisos de **"shipping"**:

### Cómo Verificar:
1. Ve a: https://www.mercadopago.com.ar/developers/panel/app
2. Selecciona tu aplicación
3. Ve a **"Credenciales"**
4. Verifica que los **scopes** incluyan:
   - ✅ `read` 
   - ✅ `write`
   - ✅ `offline_access`
   - ✅ **`shipping`** ← Este es crítico

### Si falta el permiso `shipping`:
1. Ve a **"Configuración"** de tu app
2. En **"Scopes"** activa **"Mercado Envíos"**
3. **Regenera tu Access Token**
4. Actualiza el `.env` con el nuevo token

---

## 🧪 Paso 4: Probar la Configuración

### Opción A: Usar la API directamente

```bash
curl -X POST \
  'https://api.mercadolibre.com/sites/MLA/shipping_options' \
  -H 'Authorization: Bearer TU_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "zip_code": "1602",
    "item": {
      "id": "test",
      "quantity": 1,
      "dimensions": "30x20x10",
      "weight": 500
    }
  }'
```

**Respuesta esperada:**
```json
{
  "options": [
    {
      "id": 123456,
      "name": "Estándar a domicilio",
      "cost": 1500.50,
      "estimated_delivery_time": {
        "type": "range",
        "date": "2025-11-05"
      }
    }
  ]
}
```

**Si devuelve error:**
- `401 Unauthorized`: Token inválido o sin permisos
- `400 Bad Request`: Dirección de origen no configurada
- `403 Forbidden`: Mercado Envíos no activado

### Opción B: Ver logs en Vercel

1. Ve a tu proyecto en Vercel
2. Abre **"Logs"** o **"Functions"**
3. Agrega un producto al carrito con dirección completa
4. Busca logs que empiecen con:
   - `📦 Datos enviados a Mercado Envíos:`
   - `🌐 Mercado Envíos API response status:`
   - `❌ Error calculando envío desde Mercado Libre:`

---

## 🐛 Troubleshooting Común

### Problema 1: "No hay métodos de envío disponibles"

**Causas:**
- ❌ Mercado Envíos no activado en tu cuenta
- ❌ Dirección de origen no configurada
- ❌ Token sin permisos `shipping`
- ❌ Producto sin dimensiones completas

**Solución:**
1. Activar ME en panel de Mercado Pago
2. Configurar dirección de origen
3. Verificar token tenga scope `shipping`
4. Asegurar que productos tengan peso/ancho/alto/largo

### Problema 2: "401 Unauthorized"

**Causa:** Access Token inválido o expirado

**Solución:**
1. Regenerar token en panel de Mercado Pago
2. Actualizar `.env` y `.env.local`
3. Redeploy en Vercel

### Problema 3: "Productos sin dimensiones"

**Causa:** Producto en base de datos sin peso/dimensiones

**Solución:**
1. Ir al panel admin: `/admin/productos`
2. Editar producto
3. Completar sección **"Dimensiones y Peso"**:
   - Peso (gramos)
   - Ancho (cm)
   - Alto (cm)
   - Largo (cm)

---

## ✅ Checklist Final

Antes de esperar que Mercado Envíos funcione, verifica:

- [ ] Mercado Envíos **activado** en panel de Mercado Pago
- [ ] Dirección de origen **configurada** correctamente
- [ ] Access Token con permiso **`shipping`**
- [ ] Token actualizado en `.env` (Vercel) y `.env.local`
- [ ] Productos con **peso, ancho, alto, largo** completos
- [ ] Redeploy en Vercel después de cambiar token

---

## 📚 Documentación Oficial

- **Mercado Envíos:** https://www.mercadopago.com.ar/developers/es/docs/checkout-api/shipments
- **API Shipping Options:** https://developers.mercadolibre.com.ar/es_ar/envios-y-fulfillment
- **Scopes y Permisos:** https://www.mercadopago.com.ar/developers/es/docs/security/oauth/scopes

---

## 🆘 Si Sigue Sin Funcionar

Ejecuta el carrito con dirección completa y envíame los logs de Vercel que contengan:
- `📦 Datos enviados a Mercado Envíos:`
- `🌐 Mercado Envíos API response status:`
- `❌ Error calculando envío desde Mercado Libre:`

Con esos logs puedo identificar el problema exacto.
