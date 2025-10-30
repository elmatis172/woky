# 🚚 Configuración de Mercado Envíos

## ⚠️ Problema Detectado

Mercado Envíos no aparece porque falta configurar el **Access Token de Mercado Pago**.

---

## ✅ Solución - Pasos a seguir

### 1. Obtener el Access Token de Mercado Pago

1. Ve a: https://www.mercadopago.com.ar/developers/panel
2. Inicia sesión con tu cuenta de Mercado Pago
3. Ve a **"Tus aplicaciones"** → selecciona tu aplicación
4. En la sección **"Credenciales"**, copia el **Access Token** (producción o prueba)

### 2. Configurar el archivo `.env`

Abrí el archivo `.env` en la raíz del proyecto y reemplazá esta línea:

```env
MP_ACCESS_TOKEN=your-mercadopago-access-token-here
```

Por tu token real:

```env
MP_ACCESS_TOKEN=APP_USR-1234567890123456-123456-abcdef1234567890-123456789
```

⚠️ **IMPORTANTE:** El token debe empezar con `APP_USR-` (producción) o `TEST-` (sandbox/pruebas)

### 3. Reiniciar el servidor

Después de guardar el `.env`, reiniciá el servidor de desarrollo:

```bash
# Detener el servidor (Ctrl + C)
# Luego reiniciar
npm run dev
```

---

## 🧪 Verificar que funciona

### Opción 1: Ver logs en consola

Cuando se cargue el carrito, deberías ver en la consola del servidor:

```
✅ Mercado Envíos devolvió 3 opciones
```

Si ves esto, significa que **NO** está configurado:
```
⚠️ MP_ACCESS_TOKEN no configurado - Mercado Envíos no disponible
```

### Opción 2: Probar en el carrito

1. Agregá un producto al carrito
2. Andá al carrito
3. Completá provincia y código postal
4. Deberías ver **2 tipos de envíos**:
   - ✅ Tus 3 métodos locales (los que creaste)
   - ✅ Opciones de Mercado Envíos (Correo Argentino, etc.)

---

## 📦 Requisitos para Mercado Envíos

Para que Mercado Envíos funcione, el producto **DEBE** tener:

- ✅ **Peso** (en gramos): ej. `250`
- ✅ **Ancho** (en cm): ej. `25`
- ✅ **Alto** (en cm): ej. `5`
- ✅ **Largo** (en cm): ej. `30`

Si falta alguna dimensión, Mercado Envíos no se calculará, pero tus métodos locales seguirán funcionando.

---

## 🔍 Troubleshooting

### "No aparecen opciones de Mercado Envíos"

**Verificá:**
1. ✅ El token está configurado en `.env`
2. ✅ El token es correcto y no expiró
3. ✅ Reiniciaste el servidor después de cambiar `.env`
4. ✅ El producto tiene **todas** las dimensiones (peso, ancho, alto, largo)
5. ✅ El código postal es válido (ej: `1043` para CABA)

### "Error 401 al calcular envío"

→ El token es inválido o expiró. Generá uno nuevo en el panel de Mercado Pago.

### "Error 400 al calcular envío"

→ Las dimensiones o peso del producto son inválidas (ej: negativos, cero, o muy grandes).

---

## 📝 Archivos Actualizados

Los siguientes archivos fueron creados/actualizados:

- ✅ `lib/env.ts` - Carga y valida variables de entorno
- ✅ `lib/db.ts` - Cliente de Prisma
- ✅ `lib/mercado-envios.ts` - Lógica de cálculo de Mercado Envíos
- ✅ `app/api/shipping/calculate/route.ts` - API de cálculo de envío

---

## 🚀 Próximos pasos

1. **Configurá el token** en `.env`
2. **Reiniciá el servidor**
3. **Probá en el carrito**
4. Si funciona, ¡listo! 🎉

Si después de hacer esto sigue sin aparecer, avisame y revisamos los logs juntos.
