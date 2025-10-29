# 🛒 Guía de Integración de Mercado Pago - Woky Kids

## 📋 Checklist de Integración

### ✅ Paso 1: Crear Cuenta de Mercado Pago Developer

1. Ve a: https://www.mercadopago.com.ar/developers
2. Inicia sesión con tu cuenta de Mercado Pago (o créala si no tenés)
3. Acepta los términos y condiciones de desarrollador

### ✅ Paso 2: Crear una Aplicación

1. En el panel de Mercado Pago Developers, hacé clic en **"Tus integraciones"**
2. Hacé clic en **"Crear aplicación"**
3. Completá los datos:
   - **Nombre**: Woky Kids
   - **Modelo de integración**: Checkout Pro (recomendado para e-commerce)
   - **Producto**: Pagos online
4. Guardá la aplicación

### ✅ Paso 3: Obtener Credenciales de PRUEBA (Testing)

1. En tu aplicación, ve a **"Credenciales"**
2. Seleccioná **"Credenciales de prueba"**
3. Copiá:
   - **Access Token** (TEST-xxxxxxx-xxxxxx-xxxxx-xxxxxxxx-xxxxxxxx)
   - **Public Key** (TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)

### ✅ Paso 4: Configurar en Desarrollo Local

1. Abrí el archivo `.env.local` (crealo si no existe):
   ```bash
   # Mercado Pago - CREDENCIALES DE PRUEBA
   MP_ACCESS_TOKEN=TEST-1234567890-123456-abcdef1234567890abcdef1234567890-123456789
   MP_PUBLIC_KEY=TEST-12345678-1234-1234-1234-123456789012
   ```

2. Reiniciá el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### ✅ Paso 5: Probar en Local

1. Agregá productos al carrito
2. Hacé clic en "Finalizar Compra"
3. Completá los datos de envío
4. Hacé clic en "Pagar con Mercado Pago"
5. Usá las **tarjetas de prueba** de Mercado Pago:

#### 🏦 Tarjetas de Prueba

**Para pago APROBADO:**
- Tarjeta: `4509 9535 6623 3704`
- Vencimiento: `11/25`
- CVV: `123`
- Nombre: `APRO`
- DNI: `12345678`

**Para pago RECHAZADO:**
- Tarjeta: `4509 9535 6623 3704`
- Nombre: `OTROA` (cualquier otro nombre rechaza el pago)

**Para otros estados:**
- `CONT`: Pendiente de contracargo
- `CALL`: Llamar para autorizar
- `FUND`: Monto insuficiente
- `SECU`: Código de seguridad inválido
- `EXPI`: Fecha de expiración inválida
- `FORM`: Error en formulario

📖 Ver lista completa: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards

### ✅ Paso 6: Configurar en Vercel (Producción)

1. Ve a: https://vercel.com/elmatis172s-projects/woky/settings/environment-variables

2. Agregá las variables de entorno:

   **Para TESTING (Preview/Development):**
   ```
   Name: MP_ACCESS_TOKEN
   Value: TEST-1234567890-123456-abcdef... (tu token de prueba)
   Environment: ✓ Development ✓ Preview
   ```

   **Para PRODUCCIÓN:**
   ```
   Name: MP_ACCESS_TOKEN
   Value: APP_USR-1234567890-123456-abcdef... (tu token de producción)
   Environment: ✓ Production
   ```

3. Hacé clic en **"Save"**

4. **Re-deploy** la aplicación para aplicar las variables

### ✅ Paso 7: Obtener Credenciales de PRODUCCIÓN (Real)

⚠️ **IMPORTANTE**: Solo hacé esto cuando estés listo para aceptar pagos reales

1. En Mercado Pago Developers, ve a tu aplicación
2. Seleccioná **"Credenciales de producción"**
3. Es posible que te pida completar datos fiscales y de la empresa
4. Una vez aprobado, copiá:
   - **Access Token de Producción** (APP_USR-xxxxxxx...)
   - **Public Key de Producción** (APP_USR-xxxxxxx...)

5. Actualizá las variables de entorno en Vercel (solo Production)

### ✅ Paso 8: Configurar Webhooks (Notificaciones)

1. En Mercado Pago Developers, ve a tu aplicación
2. Ve a **"Webhooks"** o **"Notificaciones"**
3. Agregá la URL de tu webhook:
   ```
   https://woky-two.vercel.app/api/mp-webhook
   ```
4. Seleccioná los eventos a escuchar:
   - ✓ payment
   - ✓ merchant_order

5. Guardá la configuración

### ✅ Paso 9: Verificar Integración

**En desarrollo:**
```bash
# 1. Verificar que las variables estén cargadas
npm run dev

# 2. En la consola del navegador, hacer una compra de prueba
# 3. Verificar logs en la terminal
```

**En producción:**
1. Hacé una compra de prueba
2. Revisá los logs en Vercel: https://vercel.com/elmatis172s-projects/woky/logs
3. Verificá que la orden se cree en la base de datos
4. Verificá que recibas el webhook de Mercado Pago

## 🔍 Diagnóstico de Problemas

### Error 500 en /api/mp

**Causa común**: MP_ACCESS_TOKEN no configurado

**Solución**:
1. Verificá que la variable esté en Vercel
2. Hacé un re-deploy después de agregar la variable
3. Verificá los logs en Vercel

### Pago no se confirma

**Causa común**: Webhook no configurado o URL incorrecta

**Solución**:
1. Verificá la URL del webhook en Mercado Pago
2. Verificá que `/api/mp-webhook` responda (no 404)
3. Revisá logs de webhooks en Mercado Pago Developers

### Orden se crea pero no redirige

**Causa común**: initPoint o sandboxInitPoint no se devuelve

**Solución**:
1. Revisá logs de la API `/api/mp`
2. Verificá que createPreference retorne correctamente
3. Verificá que el frontend reciba el initPoint

## 📞 Recursos Adiciales

- **Documentación oficial**: https://www.mercadopago.com.ar/developers/es/docs
- **Tarjetas de prueba**: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards
- **Dashboard de Mercado Pago**: https://www.mercadopago.com.ar/activities
- **Soporte**: https://www.mercadopago.com.ar/developers/es/support

## ✅ Estado Actual de la Integración

- [x] Código de integración implementado
- [x] API endpoints creados (/api/mp, /api/mp-webhook)
- [x] Manejo de órdenes en base de datos
- [ ] **Credenciales configuradas** ← NECESITÁS HACER ESTO
- [ ] Webhooks configurados
- [ ] Probado en ambiente de prueba
- [ ] Listo para producción

---

**Próximo paso**: Configurar MP_ACCESS_TOKEN en Vercel y probar una compra
