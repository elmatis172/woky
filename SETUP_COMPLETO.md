# 🚀 Setup Completo - Woky Kids Store

## 📋 Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Variables de Entorno](#variables-de-entorno)
3. [Instalación](#instalación)
4. [Configuración de Servicios](#configuración-de-servicios)
5. [Base de Datos](#base-de-datos)
6. [Deployment](#deployment)
7. [Características Implementadas](#características-implementadas)

---

## 🔧 Requisitos Previos

### Software Necesario
- **Node.js**: v18.17.0 o superior
- **npm**: v9.0.0 o superior
- **Git**: Para clonar el repositorio
- **VS Code**: Editor recomendado

### Cuentas Requeridas
1. **GitHub** (para el código)
2. **Vercel** (para deployment)
3. **Neon** (PostgreSQL database)
4. **Mercado Pago** (pagos)
5. **Cloudinary** (imágenes - opcional)

---

## 🔐 Variables de Entorno

### Archivo `.env.local` (Desarrollo)

```bash
# ============================================
# DATABASE
# ============================================
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"

# ============================================
# NEXT AUTH
# ============================================
NEXTAUTH_SECRET="tu-secret-key-super-seguro-cambiar-en-produccion"
NEXTAUTH_URL="http://localhost:3000"

# ============================================
# MERCADO PAGO
# ============================================
# Credenciales de TEST (desarrollo)
MP_ACCESS_TOKEN="TEST-1234567890-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx-123456789"
MP_PUBLIC_KEY="TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Credenciales de PRODUCCIÓN (comentadas en desarrollo)
# MP_ACCESS_TOKEN="APP_USR-1234567890-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx-123456789"
# MP_PUBLIC_KEY="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# ============================================
# CLOUDINARY (Opcional - para imágenes)
# ============================================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="tu-api-secret"

# ============================================
# CORREO ELECTRÓNICO (Opcional - para notificaciones)
# ============================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tu-email@gmail.com"
SMTP_PASSWORD="tu-app-password"
SMTP_FROM="Woky Kids <noreply@woky.com>"

# ============================================
# OTROS
# ============================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Archivo `.env.production` (Vercel)

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST-pooler/DATABASE?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
NEXTAUTH_SECRET="production-secret-key-different-from-dev"
NEXTAUTH_URL="https://tu-dominio.vercel.app"
MP_ACCESS_TOKEN="APP_USR-production-token"
MP_PUBLIC_KEY="APP_USR-production-public-key"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="tu-cloud-name"
NEXT_PUBLIC_APP_URL="https://tu-dominio.vercel.app"
NODE_ENV="production"
```

---

## 📦 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/elmatis172/woky.git
cd woky
```

### 2. Instalar Dependencias

```bash
npm install --legacy-peer-deps
```

**Nota**: Se usa `--legacy-peer-deps` por compatibilidad entre Next.js 15 y algunas dependencias.

### 3. Configurar Variables de Entorno

```bash
# Copiar el template
cp .env.example .env.local

# Editar con tus credenciales
code .env.local
```

### 4. Generar Prisma Client

```bash
npx prisma generate
```

### 5. Configurar Base de Datos

```bash
# Crear las tablas
npx prisma db push

# (Opcional) Poblar con datos de prueba
npx prisma db seed
```

### 6. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## ⚙️ Configuración de Servicios

### 🐘 Neon PostgreSQL

1. Crear cuenta en [Neon.tech](https://neon.tech)
2. Crear nuevo proyecto
3. Copiar las URLs de conexión:
   - **DATABASE_URL**: Para conexiones pooled (con `-pooler`)
   - **DIRECT_URL**: Para migraciones (sin `-pooler`)

**Formato de URL:**
```
postgresql://USER:PASSWORD@HOST-pooler.region.aws.neon.tech/DATABASE?sslmode=require
```

### 💳 Mercado Pago

#### Credenciales de TEST (Desarrollo)

1. Ir a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Crear aplicación
3. En "Credenciales de prueba":
   - Copiar **Access Token** → `MP_ACCESS_TOKEN`
   - Copiar **Public Key** → `MP_PUBLIC_KEY`

#### Credenciales de PRODUCCIÓN

1. Completar datos de la aplicación
2. Solicitar aprobación
3. En "Credenciales de producción":
   - Copiar **Access Token**
   - Copiar **Public Key**

#### Webhook Configuration

**URL del Webhook:**
```
https://tu-dominio.vercel.app/api/mp-webhook
```

**Eventos a Suscribir:**
- `payment` (pagos)
- `merchant_order` (órdenes)

**Configuración en Mercado Pago:**
1. Panel → Aplicación → Webhooks
2. Agregar URL
3. Seleccionar eventos
4. Guardar

### 🔐 NextAuth Configuration

**Generar Secret:**
```bash
openssl rand -base64 32
```

O usar [generate-secret.vercel.app](https://generate-secret.vercel.app/)

### ☁️ Cloudinary (Opcional)

1. Crear cuenta en [Cloudinary](https://cloudinary.com)
2. Dashboard → Copiar:
   - Cloud Name
   - API Key
   - API Secret

---

## 🗄️ Base de Datos

### Schema Prisma Principal

El schema completo está en `prisma/schema.prisma`. Modelos principales:

- **User**: Usuarios (ADMIN/CUSTOMER)
- **Category**: Categorías de productos
- **Product**: Productos con precios, stock, dimensiones, costos
- **ProductVariant**: Variantes de talles (XS, S, M, L, XL, etc.)
- **Order**: Órdenes de compra
- **OrderItem**: Items de órdenes (con soporte de variantes)
- **ShippingMethod**: Métodos de envío

### Migraciones

```bash
# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Aplicar en producción
npx prisma migrate deploy

# Reset completo (CUIDADO - borra datos)
npx prisma migrate reset
```

### Seed Data

Archivo: `prisma/seed.ts`

```bash
# Ejecutar seed
npm run seed

# O directamente
npx prisma db seed
```

### Comandos Útiles

```bash
# Ver datos en Prisma Studio
npx prisma studio

# Formatear schema
npx prisma format

# Validar schema
npx prisma validate

# Generar cliente
npx prisma generate
```

---

## 🚀 Deployment

### Vercel (Recomendado)

#### Setup Inicial

1. Instalar CLI:
```bash
npm i -g vercel
```

2. Login:
```bash
vercel login
```

3. Configurar proyecto:
```bash
vercel
```

#### Variables de Entorno en Vercel

**Agregar desde CLI:**
```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add MP_ACCESS_TOKEN
# ... todas las demás
```

**O desde Dashboard:**
1. Proyecto → Settings → Environment Variables
2. Agregar cada variable (Production, Preview, Development)

#### Deploy

```bash
# Deploy a preview
vercel

# Deploy a producción
vercel --prod

# O con git push (auto-deploy)
git push origin main
```

### Build Commands

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && prisma db push --accept-data-loss && next build",
    "start": "next start",
    "lint": "next lint",
    "postinstall": "prisma generate",
    "prepare": "husky install"
  }
}
```

---

## ✨ Características Implementadas

### 🛒 Sistema de Variantes (Talles)

**Archivos principales:**
- `prisma/schema.prisma` - Modelos ProductVariant, OrderItem
- `components/size-selector.tsx` - Selector de talles
- `components/product-actions.tsx` - Wrapper con estado
- `app/(store)/carrito/page.tsx` - Carrito con variantes
- `app/api/mp/route.ts` - Checkout con validación de stock por variante
- `app/api/mp-webhook/route.ts` - Descuento de stock por variante

**Flow:**
1. Usuario selecciona talle → Se guarda `variantId` en localStorage
2. Checkout valida stock del talle específico
3. Orden guarda `variantId` en OrderItem
4. Webhook descuenta stock de ProductVariant correcto

### 💰 Sistema de Costos y Márgenes

**Campos en Product:**
- `cost` (Int?) - Costo base en centavos
- `additionalCosts` (Int?) - Costos adicionales en centavos

**Archivos:**
- `components/admin/product-form.tsx` - Inputs de costos con calculadora
- `app/(admin)/admin/finanzas/page.tsx` - Dashboard de márgenes

**Cálculos:**
```typescript
const totalCost = (cost || 0) + (additionalCosts || 0)
const profit = price - totalCost
const margin = price > 0 ? (profit / price) * 100 : 0
```

### 📦 Integración Mercado Pago

**APIs:**
- `POST /api/mp` - Crear preferencia de pago
- `POST /api/mp-webhook` - Webhook para confirmación

**Proceso:**
1. Usuario completa checkout
2. Se crea orden en DB (status: PENDING)
3. Se genera preferencia en MP
4. Usuario paga en MP
5. Webhook actualiza orden (status: PAID)
6. Se descuenta stock

### 🚚 Sistema de Envíos

**Métodos:**
- Envío gratuito (configurable)
- OCA (integración parcial)
- Mercado Envíos (a través de MP)
- Métodos personalizados

**Archivo:**
- `app/api/shipping/calculate/route.ts`

### 👤 Autenticación

**Sistema:** NextAuth.js v5 (beta)

**Roles:**
- `ADMIN` - Acceso al panel de administración
- `CUSTOMER` - Usuario normal

**Páginas protegidas:**
- `/admin/*` - Solo ADMIN
- `/perfil` - Usuarios logueados

### 📊 Panel de Administración

**Rutas:**
- `/admin` - Dashboard general
- `/admin/productos` - Gestión de productos
- `/admin/categorias` - Gestión de categorías
- `/admin/ordenes` - Gestión de órdenes
- `/admin/usuarios` - Gestión de usuarios
- `/admin/envios` - Métodos de envío
- `/admin/finanzas` - Análisis de márgenes

---

## 🔍 Troubleshooting

### Error: "Cannot find module '@prisma/client'"

```bash
npx prisma generate
```

### Error: Build falla con backticks literales

**Causa:** PowerShell inserta `` `n `` literal en lugar de newlines.

**Solución:** Usar `.Replace()` con strings literales:
```powershell
$file.Replace('`n', "`r`n")
```

### Error: "Database connection failed"

1. Verificar `DATABASE_URL` en `.env.local`
2. Verificar IP en whitelist de Neon
3. Usar `DIRECT_URL` para migraciones

### Error: Mercado Pago no redirige

1. Verificar `MP_ACCESS_TOKEN` y `MP_PUBLIC_KEY`
2. Verificar que `NEXTAUTH_URL` sea correcto
3. Revisar logs en `/api/mp`

### Error: Build en Vercel con ESLint

**Solución:** Deshabilitar reglas problemáticas en `.eslintrc.json`:
```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "warn"
  }
}
```

---

## 📝 Notas Importantes

### Pricing (Centavos)

**SIEMPRE trabajar con centavos en backend:**
```typescript
// Guardar
price: 12500 // $125.00

// Mostrar
formatPrice(12500) // "$125.00"
```

### Imágenes

**Formato esperado:**
```typescript
images: string[] // Array de URLs
images: ["https://cloudinary.com/...", "https://..."]
```

### Stock Management

**Con variantes:**
- Stock se guarda en `ProductVariant.stock`
- Product.stock es ignorado

**Sin variantes:**
- Stock se guarda en `Product.stock`

### Webhook Security

**Validar firma de Mercado Pago:**
```typescript
// En /api/mp-webhook/route.ts
const xSignature = headers.get("x-signature")
const xRequestId = headers.get("x-request-id")
// Validar según docs de MP
```

---

## 🆘 Soporte

### Documentación Oficial

- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **NextAuth**: https://next-auth.js.org
- **Mercado Pago**: https://www.mercadopago.com.ar/developers/es/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com

### Logs Útiles

```bash
# Ver logs de Vercel
vercel logs

# Ver logs de desarrollo
npm run dev

# Ver queries de Prisma
# Agregar en schema.prisma:
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["tracing"]
}
```

---

## 📋 Checklist de Setup

- [ ] Node.js instalado
- [ ] Proyecto clonado
- [ ] Dependencias instaladas (`npm install --legacy-peer-deps`)
- [ ] `.env.local` configurado
- [ ] Base de datos Neon creada
- [ ] Prisma generado (`npx prisma generate`)
- [ ] Base de datos migrada (`npx prisma db push`)
- [ ] Mercado Pago configurado (TEST)
- [ ] Servidor de desarrollo corriendo (`npm run dev`)
- [ ] Usuario admin creado
- [ ] Productos de prueba creados
- [ ] Webhook de MP configurado (producción)
- [ ] Variables de entorno en Vercel
- [ ] Deploy exitoso en Vercel
- [ ] Mercado Pago PRODUCCIÓN configurado

---

## 🎉 ¡Listo!

Tu setup está completo. Ahora puedes:

1. Desarrollar localmente con `npm run dev`
2. Hacer cambios y commit con Git
3. Push a GitHub activa auto-deploy en Vercel
4. Monitorear en Vercel Dashboard

**¡Éxitos con tu tienda Woky Kids! 🚀**
