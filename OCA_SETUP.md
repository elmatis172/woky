# Configuración de OCA e-Pak

## 📋 Requisitos Previos

1. **Cuenta de OCA e-Pak**
   - Registro en: https://www5.oca.com.ar/ocaepak
   - CUIT de la empresa registrado en OCA

2. **Credenciales necesarias:**
   - CUIT (con guiones, ej: `30-12345678-9`)
   - Usuario de e-Pak
   - Contraseña de e-Pak
   - Número de cuenta OCA (ej: `111757/001`)
   - Operativas habilitadas (se obtienen desde OCA)

## 🔧 Configuración en .env

Agregar las siguientes variables al archivo `.env`:

```bash
# OCA Configuration
OCA_CUIT="30-12345678-9"              # Tu CUIT con guiones
OCA_USERNAME="tu-email@empresa.com"    # Usuario de e-Pak
OCA_PASSWORD="tu-password"             # Contraseña de e-Pak
OCA_ACCOUNT_NUMBER="123456/001"        # Número de cuenta OCA
OCA_ORIGIN_ZIP_CODE="1602"             # CP desde donde enviás (default: Vicente López)
OCA_TEST_MODE="false"                  # true para ambiente de pruebas, false para producción
```

### Ambiente de Pruebas (Testing)

Si querés probar sin una cuenta real, usá estas credenciales de prueba:

```bash
OCA_CUIT="30-53625919-4"
OCA_USERNAME="test@oca.com.ar"
OCA_PASSWORD="123456"
OCA_ACCOUNT_NUMBER="111757/001"
OCA_ORIGIN_ZIP_CODE="1602"
OCA_TEST_MODE="true"
```

**Operativas de prueba disponibles:**
- Puerta a Puerta: `64665`
- Puerta a Sucursal: `62342`
- Sucursal a Puerta: `94584`
- Sucursal a Sucursal: `78254`

## 📦 Cómo Funciona

### 1. Cotización de Envío

La integración llama a la API de OCA con:
- **Peso total** (en kg)
- **Volumen total** (en m³)
- **CP Origen** (tu dirección)
- **CP Destino** (dirección del cliente)
- **Valor declarado** (precio de los productos)
- **Cantidad de paquetes**

### 2. Operativas Soportadas

Por defecto, la integración cotiza:
- **Puerta a Puerta:** El envío va desde tu dirección hasta la del cliente
- **Puerta a Sucursal:** El envío va desde tu dirección hasta una sucursal OCA

### 3. Cálculo de Dimensiones

El sistema calcula automáticamente:
- **Peso:** Suma el peso de todos los productos (gramos → kg)
- **Volumen:** Suma el volumen de todos los productos (cm³ → m³)
- **Valor:** Suma el precio de todos los productos (centavos → pesos)

## 🚀 Activación

### Paso 1: Agregar Variables de Entorno

En Vercel:
1. Ir a **Settings** → **Environment Variables**
2. Agregar cada variable:
   - `OCA_CUIT`
   - `OCA_USERNAME`
   - `OCA_PASSWORD`
   - `OCA_ACCOUNT_NUMBER`
   - `OCA_ORIGIN_ZIP_CODE`
   - `OCA_TEST_MODE`

### Paso 2: Redeploy

```bash
git add .
git commit -m "feat: Add OCA shipping integration"
git push origin main
```

Vercel hará un nuevo deploy automáticamente.

### Paso 3: Verificar en Logs

Una vez deployado, probá agregando un producto al carrito y yendo a la página de envío. En los logs de Vercel deberías ver:

```
🔎 Cotizando OCA Puerta a Puerta: { peso: '0.50 kg', volumen: '0.0001 m³', ... }
📦 Respuesta OCA Puerta a Puerta: <xml>...
✅ Tarifa OCA Puerta a Puerta: $1500
🚚 Opciones OCA: 2
```

## 🔍 Troubleshooting

### "OCA_CUIT no configurado"

**Problema:** Falta la variable de entorno  
**Solución:** Verificar que `OCA_CUIT` esté en `.env` y en Vercel

### "No se encontraron tarifas"

**Posibles causas:**
1. **CP incorrecto:** Verificar que el código postal de destino sea válido
2. **Dimensiones faltantes:** Asegurar que todos los productos tengan peso y dimensiones
3. **Operativa no habilitada:** Contactar con OCA para activar la operativa

### "Error en respuesta XML"

**Posible causa:** Error de autenticación o datos inválidos  
**Solución:**
1. Verificar CUIT (debe tener guiones: `30-12345678-9`)
2. Verificar que el usuario y contraseña sean correctos
3. Verificar que el número de cuenta sea válido

### Debugging

Agregar en `lib/oca.ts` para ver más detalles:

```typescript
console.log('🔎 OCA Request:', {
  cuit: quoteParams.cuit,
  operativa: quoteParams.operativa,
  peso: quoteParams.pesoTotal,
  volumen: quoteParams.volumenTotal,
  origen: quoteParams.codigoPostalOrigen,
  destino: quoteParams.codigoPostalDestino,
});
```

## 📚 Documentación Oficial

- **API Docs:** https://developers.oca.com.ar/epak.html
- **e-Pak Login:** https://www5.oca.com.ar/ocaepak
- **Contacto Comercial:** https://www.oca.com.ar/ContactoComercial

## 🆘 Soporte

Si tenés problemas con la integración:

1. **Revisar logs en Vercel:** Ver qué responde la API de OCA
2. **Probar con credenciales de test:** Usar `OCA_TEST_MODE="true"`
3. **Contactar OCA:** Si los datos son correctos pero no funciona
4. **Abrir issue:** Si es un bug del código de integración

---

**Estado actual:** ✅ Integración completa y lista para usar  
**Último update:** 31 de Octubre, 2025
