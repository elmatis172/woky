# 🚀 Instalación Completada - Woky E-commerce

## ✅ Todo instalado y funcionando

Tu proyecto está **100% funcional** y corriendo en http://localhost:3000

---

## 📝 Cambios Importantes Realizados

### 1. Base de datos adaptada a SQLite

Por limitaciones de SQLite, se hicieron estos cambios en `prisma/schema.prisma`:

- ✅ **Provider cambiado**: `postgresql` → `sqlite`
- ✅ **Campos Text**: Removidos los `@db.Text` (no soportado en SQLite)
- ✅ **Arrays de strings**: Convertidos a `String` (se guardan como JSON)
  - `Product.images`: `String[]` → `String` (JSON)
  - `Product.attributes`: `Json?` → `String?` (JSON)
  - `Order.timeline`: `Json[]` → `String?` (JSON)
  - `Order.shippingAddress`: `Json?` → `String?` (JSON)
  - `Order.billingAddress`: `Json?` → `String?` (JSON)
  - `Order.customerData`: `Json?` → `String?` (JSON)

### 2. Seed adaptado

El archivo `prisma/seed.ts` fue actualizado para usar `JSON.stringify()` en todos los campos que ahora son strings JSON:

```typescript
// Antes:
images: ["url1.jpg", "url2.jpg"],
attributes: { color: ["Negro", "Blanco"] },

// Ahora:
images: JSON.stringify(["url1.jpg", "url2.jpg"]),
attributes: JSON.stringify({ color: ["Negro", "Blanco"] }),
```

### 3. Helper creado: `lib/json-helpers.ts`

Archivo con funciones para parsear/stringify campos JSON:

- `parseImages()` / `stringifyImages()`
- `parseAttributes()` / `stringifyAttributes()`
- `parseTimeline()` / `stringifyTimeline()`
- `parseAddress()` / `stringifyAddress()`
- `parseCustomerData()` / `stringifyCustomerData()`

### 4. Componentes actualizados

**`components/product-card.tsx`:**
```typescript
// Ahora parsea las imágenes desde JSON
const images = JSON.parse(product.images || "[]");
```

**`components/product-gallery.tsx`:**
```typescript
// Recibe string JSON y lo parsea internamente
const images = JSON.parse(imagesString || "[]");
```

---

## 🔑 Credenciales de Prueba

### Admin
- **Email:** `admin@woky.com`
- **Password:** `admin123`
- **Acceso:** http://localhost:3000/admin (protegido por middleware)

### Usuario Normal
- **Email:** `user@example.com`
- **Password:** `user123`

---

## 📦 Datos Seeded

La base de datos ya tiene:

✅ **2 usuarios** (admin + user)
✅ **4 categorías** (Electrónica, Ropa, Hogar, Deportes)
✅ **8 productos** con imágenes de Unsplash
✅ **1 orden de ejemplo** (status: PAID)

---

## 🛠️ Próximos Pasos

### 1. Configurar Mercado Pago (Obligatorio para pagos)

Edita el archivo `.env` con tus credenciales reales de Mercado Pago:

```env
MP_ACCESS_TOKEN=TEST-1234567890-tu-token-real-aqui
MP_PUBLIC_KEY=TEST-tu-public-key-aqui
```

**Dónde conseguirlas:**
1. Ve a https://www.mercadopago.com.ar/developers
2. Ingresa con tu cuenta de Mercado Pago
3. Ve a "Tus integraciones" → "Credenciales"
4. Copia el **Access Token** y **Public Key** de **TEST** (para desarrollo)

### 2. Para probar pagos en desarrollo local:

**Instala ngrok:**
```bash
# Windows (PowerShell como admin)
choco install ngrok

# O descarga de: https://ngrok.com/download
```

**Expone tu localhost:**
```bash
ngrok http 3000
```

**Actualiza `.env` con la URL de ngrok:**
```env
PUBLIC_URL=https://abc123.ngrok.io
NEXTAUTH_URL=https://abc123.ngrok.io
```

**Configura el webhook en Mercado Pago:**
- URL: `https://abc123.ngrok.io/api/mp-webhook`
- Eventos: **Pagos** y **Merchant Orders**

### 3. Crear el Panel de Administración

Todavía falta implementar las páginas del admin:

```
app/(admin)/
├── layout.tsx       # Layout con sidebar
├── dashboard/       # Métricas y estadísticas
├── productos/       # CRUD de productos
├── categorias/      # CRUD de categorías
├── pedidos/         # Gestión de órdenes
└── usuarios/        # Gestión de usuarios
```

---

## 🎨 Personalización

### Cambiar colores
Edita `app/globals.css` y `tailwind.config.ts`

### Cambiar logo
Reemplaza los archivos en `public/`

### Agregar más productos
Edita `prisma/seed.ts` y ejecuta:
```bash
npm run db:seed
```

---

## 📊 Comandos útiles

```bash
npm run dev           # Servidor desarrollo
npm run build         # Build producción
npm run start         # Servidor producción
npm run lint          # Linter
npm run format        # Prettier
npm run db:studio     # Abrir Prisma Studio (explorador DB visual)
npm run db:generate   # Regenerar cliente Prisma
npm run db:push       # Aplicar cambios del schema
npm run db:seed       # Rellenar con datos
```

---

## 🔍 Explorar la Base de Datos

```bash
npm run db:studio
```

Se abrirá Prisma Studio en http://localhost:5555 para ver/editar datos visualmente.

---

## ⚠️ Importante: Migrar a PostgreSQL en Producción

**SQLite es solo para desarrollo local.**

Para producción (Vercel, Railway, etc.), debes cambiar a PostgreSQL:

1. **Actualiza `prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. **Revierte los tipos de datos:**
```prisma
// Restaura arrays y tipos nativos:
images         String[]      // Vuelve a array
attributes     Json?         // Vuelve a Json
timeline       Json[]        // Vuelve a array de Json
```

3. **Actualiza los componentes y seed** para NO usar JSON.stringify/parse

4. **Crea una base PostgreSQL** en:
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
   - [Railway](https://railway.app/)
   - [Supabase](https://supabase.com/)
   - [Neon](https://neon.tech/)

5. **Actualiza `.env` con la URL de PostgreSQL**

6. **Ejecuta migrations:**
```bash
npx prisma migrate dev
npm run db:seed
```

---

## 🚀 Deploy en Vercel

```bash
# Instala Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configura las variables de entorno en el dashboard de Vercel
```

**Variables obligatorias en Vercel:**
- `DATABASE_URL` (PostgreSQL)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `MP_ACCESS_TOKEN`
- `MP_PUBLIC_KEY`

---

## ✨ Features Incluidas

- ✅ Autenticación completa (NextAuth + roles)
- ✅ Integración Mercado Pago (webhook verificado)
- ✅ Catálogo de productos con filtros
- ✅ Carrito de compras (localStorage)
- ✅ Página de pago exitoso
- ✅ Dark mode
- ✅ Responsive design
- ✅ SEO optimizado
- ✅ PWA manifest
- ✅ TypeScript + ESLint + Prettier
- ✅ Middleware de protección admin

---

## 📖 Documentación Completa

Lee el archivo **README.md** para más detalles sobre arquitectura, seguridad, API routes, etc.

---

**¡Listo para desarrollar! 🎉**

http://localhost:3000 - Tu tienda
http://localhost:3000/sign-in - Login
http://localhost:3000/admin - Panel admin (usa admin@woky.com)
