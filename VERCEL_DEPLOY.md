# 🚀 Deploy a Vercel - Instrucciones

## Paso 1: Push completado ✅

Los cambios ya están en GitHub (commit: dffb62a)

## Paso 2: Agregar Variable de Entorno en Vercel

### Opción A: Interfaz Web (Recomendado)

1. Ve a tu proyecto en Vercel: https://vercel.com/elmatis172/woky
2. Click en **Settings** (arriba)
3. Click en **Environment Variables** (menú izquierdo)
4. Agregar nueva variable:
   - **Name**: `SHIPNOW_API_KEY`
   - **Value**: `Ioolml7ZaDTHZ53MCVjUEZbJa6sIPru6dDe7g8iuCMyhHtXfJw`
   - **Environments**: Seleccionar `Production`, `Preview`, y `Development`
5. Click **Save**

### Opción B: CLI de Vercel

```bash
# 1. Asegurarte de estar logueado
vercel login

# 2. Vincular proyecto (si no está vinculado)
vercel link

# 3. Agregar variable de entorno
vercel env add SHIPNOW_API_KEY production
# Cuando pregunte el valor, pegar:
# Ioolml7ZaDTHZ53MCVjUEZbJa6sIPru6dDe7g8iuCMyhHtXfJw

# 4. También para preview y development
vercel env add SHIPNOW_API_KEY preview
vercel env add SHIPNOW_API_KEY development
```

## Paso 3: Redeploy

Después de agregar la variable, Vercel hará un redeploy automáticamente.

O puedes forzar un redeploy:
```bash
vercel --prod
```

## Paso 4: Verificar

1. Espera que termine el deploy (~2-3 minutos)
2. Ve a tu sitio en producción
3. Prueba agregar productos al carrito
4. En la página de checkout, calcula envío
5. Deberías ver opciones de ShipNow junto con Mercado Envíos y OCA

## 🎉 ¡Listo!

Tu tienda ahora tiene integración completa con ShipNow para cotizar envíos.

---

## 📊 Lo que se deployó:

✅ `lib/shipnow.ts` - API wrapper completo
✅ `app/api/shipping/calculate/route.ts` - Cotizaciones integradas
✅ `app/api/shipping/shipnow/create/route.ts` - Crear envíos
✅ `app/api/shipping/shipnow/track/route.ts` - Tracking
✅ Documentación completa

## 🔍 Debug

Si algo no funciona, revisa los logs en Vercel:
1. Ve a tu proyecto
2. Click en **Deployments**
3. Click en el deployment más reciente
4. Click en **Functions** para ver logs

Busca errores relacionados con "ShipNow" o "SHIPNOW_API_KEY"
