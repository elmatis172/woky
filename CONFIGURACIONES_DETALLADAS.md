# 🔧 Configuraciones Específicas del Proyecto

## 📦 package.json - Dependencias Principales

```json
{
  "dependencies": {
    "next": "15.0.3",
    "react": "19.0.0-rc-65a56d0e-20241020",
    "react-dom": "19.0.0-rc-65a56d0e-20241020",
    "@prisma/client": "^6.18.0",
    "next-auth": "5.0.0-beta.25",
    "zod": "^3.23.8",
    "lucide-react": "^0.468.0",
    "@radix-ui/react-*": "varios componentes UI"
  },
  "devDependencies": {
    "prisma": "^6.18.0",
    "typescript": "^5",
    "tailwindcss": "^3.4.1"
  }
}
```

## 🗂️ Estructura de Carpetas

```
PAGINAWOKY/
├── app/
│   ├── (admin)/          # Rutas admin protegidas
│   │   └── admin/
│   │       ├── page.tsx              # Dashboard
│   │       ├── productos/            # CRUD productos
│   │       ├── categorias/           # CRUD categorías
│   │       ├── ordenes/              # Gestión órdenes
│   │       ├── usuarios/             # Gestión usuarios
│   │       ├── envios/               # Métodos envío
│   │       └── finanzas/             # Análisis márgenes
│   ├── (auth)/           # Rutas autenticación
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (store)/          # Rutas tienda pública
│   │   ├── page.tsx                  # Home
│   │   ├── productos/                # Catálogo
│   │   ├── carrito/                  # Carrito
│   │   ├── contacto/
│   │   ├── envios/
│   │   └── devoluciones/
│   ├── api/              # API Routes
│   │   ├── auth/                     # NextAuth endpoints
│   │   ├── admin/                    # APIs admin
│   │   ├── mp/                       # Mercado Pago checkout
│   │   ├── mp-webhook/               # Webhook MP
│   │   └── shipping/                 # Cálculo envíos
│   ├── globals.css       # Estilos globales
│   └── layout.tsx        # Layout principal
├── components/
│   ├── ui/               # Componentes shadcn/ui
│   ├── admin/            # Componentes admin
│   │   ├── product-form.tsx          # Formulario productos
│   │   ├── category-form.tsx         # Formulario categorías
│   │   └── shipping-method-form.tsx  # Formulario envíos
│   ├── size-selector.tsx             # Selector de talles
│   ├── product-actions.tsx           # Wrapper con estado
│   ├── add-to-cart-button.tsx        # Botón agregar
│   ├── navbar.tsx
│   └── footer.tsx
├── lib/
│   ├── db.ts             # Cliente Prisma
│   ├── auth.ts           # Config NextAuth
│   ├── mp.ts             # Utils Mercado Pago
│   ├── utils.ts          # Utilidades generales
│   └── env.ts            # Validación env vars
├── prisma/
│   ├── schema.prisma     # Schema de base de datos
│   ├── seed.ts           # Datos iniciales
│   └── migrations/       # Migraciones
├── public/
│   ├── manifest.json     # PWA manifest
│   └── robots.txt
├── .env.local            # Variables de entorno (NO commitear)
├── .env.example          # Template de variables
├── next.config.ts        # Config Next.js
├── tailwind.config.ts    # Config Tailwind
├── tsconfig.json         # Config TypeScript
└── package.json          # Dependencias
```

## ⚙️ next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  eslint: {
    // Warning: permite build con warnings de ESLint
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Habilita type checking estricto
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
```

## 🎨 tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... más colores
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

## 🔐 middleware.ts (Protección de rutas)

```typescript
export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/admin/:path*",
    "/perfil/:path*",
  ],
};
```

## 📊 Prisma Schema - Modelos Principales

### User
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String?
  role          UserRole  @default(CUSTOMER)
  emailVerified DateTime?
  image         String?
  orders        Order[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum UserRole {
  ADMIN
  CUSTOMER
}
```

### Product (con costos)
```prisma
model Product {
  id              String            @id @default(cuid())
  name            String
  slug            String            @unique
  description     String?           @db.Text
  price           Int               // Centavos
  compareAtPrice  Int?              // Precio tachado
  cost            Int?              // Costo base en centavos
  additionalCosts Int?              // Costos adicionales
  sku             String?
  stock           Int               @default(0)
  images          String[]
  status          ProductStatus     @default(DRAFT)
  featured        Boolean           @default(false)
  
  // Dimensiones para envíos
  weight          Int?              // Gramos
  width           Int?              // CM
  height          Int?              // CM
  length          Int?              // CM
  
  category        Category?         @relation(fields: [categoryId], references: [id])
  categoryId      String?
  variants        ProductVariant[]
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  @@index([slug])
  @@index([status])
  @@index([categoryId])
}
```

### ProductVariant (Talles)
```prisma
model ProductVariant {
  id         String    @id @default(cuid())
  product    Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId  String
  
  size       String    // XS, S, M, L, XL, XXL
  sku        String?   // SKU específico del talle
  price      Int?      // Precio diferencial (opcional)
  stock      Int       @default(0)
  isActive   Boolean   @default(true)
  sortOrder  Int       @default(0)
  
  orderItems OrderItem[]
  
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  
  @@unique([productId, size])
  @@index([productId])
}
```

### Order
```prisma
model Order {
  id                String      @id @default(cuid())
  email             String
  status            OrderStatus @default(PENDING)
  currency          String      @default("ARS")
  
  subtotal          Int         // Centavos
  shipping          Int         @default(0)
  discount          Int         @default(0)
  totalAmount       Int         // Centavos
  
  mpPreferenceId    String?
  mpPaymentId       String?
  
  customerData      Json?
  shippingAddress   Json?
  billingAddress    Json?
  timeline          Json?
  
  items             OrderItem[]
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@index([email])
  @@index([status])
  @@index([mpPreferenceId])
}
```

### OrderItem (con soporte de variantes)
```prisma
model OrderItem {
  id         String   @id @default(cuid())
  order      Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId    String
  
  productId  String
  product    Product? @relation(fields: [productId], references: [id], onDelete: SetNull)
  
  variantId  String?
  variant    ProductVariant? @relation(fields: [variantId], references: [id], onDelete: SetNull)
  
  name       String
  sku        String?
  unitPrice  Int      // Centavos
  quantity   Int
  image      String?
  size       String?  // Talle seleccionado
  
  createdAt  DateTime @default(now())
  
  @@index([orderId])
  @@index([productId])
  @@index([variantId])
}
```

## 🔑 NextAuth Configuration (lib/auth.ts)

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
});
```

## 💳 Mercado Pago Integration

### Crear Preferencia (lib/mp.ts)

```typescript
export async function createPreference({
  orderId,
  items,
  payer,
}: {
  orderId: string;
  items: Array<{
    title: string;
    quantity: number;
    unit_price: number;
    currency_id: string;
  }>;
  payer: {
    email: string;
    name?: string;
  };
}) {
  const response = await fetch(
    "https://api.mercadopago.com/checkout/preferences",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items,
        payer,
        back_urls: {
          success: `${process.env.NEXTAUTH_URL}/ok`,
          failure: `${process.env.NEXTAUTH_URL}/carrito`,
          pending: `${process.env.NEXTAUTH_URL}/ok`,
        },
        auto_return: "approved",
        external_reference: orderId,
        notification_url: `${process.env.NEXTAUTH_URL}/api/mp-webhook`,
      }),
    }
  );

  return response.json();
}
```

## 🎨 Componentes Clave

### SizeSelector
- Ubicación: `components/size-selector.tsx`
- Props: `variants`, `selectedSize`, `onSizeChange`
- Muestra grid de talles con stock

### ProductActions
- Ubicación: `components/product-actions.tsx`
- Wrapper client-side con estado de variante seleccionada
- Maneja lógica de agregar al carrito

### ProductForm
- Ubicación: `components/admin/product-form.tsx`
- Formulario completo de productos
- Incluye calculadora de costos y márgenes en tiempo real

## 🔄 Flujos Principales

### Flujo de Compra con Variantes

1. **Selección de Producto**
   - Usuario entra a `/productos/[slug]`
   - Ve selector de talles (SizeSelector)
   - Selecciona talle
   
2. **Agregar al Carrito**
   - ProductActions guarda en localStorage
   - ID único: `${productId}-${variantId}`
   - Guarda: productId, variantId, variantSize, quantity
   
3. **Checkout**
   - POST `/api/mp`
   - Valida stock por variante
   - Crea orden con OrderItem.variantId
   - Genera preferencia de MP
   
4. **Pago**
   - Usuario paga en Mercado Pago
   - MP notifica vía webhook
   
5. **Confirmación**
   - POST `/api/mp-webhook`
   - Actualiza orden a PAID
   - Descuenta ProductVariant.stock
   - (O Product.stock si no hay variante)

### Flujo de Cálculo de Márgenes

1. **Input en Formulario**
   - Admin ingresa cost y additionalCosts
   - Se guarda en centavos (×100)
   
2. **Cálculo Automático**
   ```typescript
   const totalCost = cost + additionalCosts
   const profit = price - totalCost
   const margin = (profit / price) * 100
   ```
   
3. **Dashboard Finanzas**
   - Query productos con cost !== null
   - Calcula márgenes
   - Ordena por margen descendente
   - Muestra top 10 con badges de color

## 🔍 Utilidades Importantes

### formatPrice (lib/utils.ts)
```typescript
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(cents / 100);
}
```

### Validación de Env Vars (lib/env.ts)
```typescript
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  NEXTAUTH_SECRET: z.string(),
  MP_ACCESS_TOKEN: z.string(),
  // ... todas las requeridas
});

export const env = envSchema.parse(process.env);
```

## 🐛 Errores Comunes y Soluciones

### Build Error: "backticks literales"
**Causa:** PowerShell inserta `` `n `` literal
**Solución:** Usar `.Replace()` con `"`r`n"`

### Error: "Cannot find module @prisma/client"
**Solución:** `npx prisma generate`

### Error: Database connection failed
**Solución:** Verificar DATABASE_URL y usar DIRECT_URL para migraciones

### Error: MP no redirige
**Solución:** Verificar que NEXTAUTH_URL esté correcto y MP_ACCESS_TOKEN sea válido

---

## 📱 PWA Configuration

```json
// public/manifest.json
{
  "name": "Woky Kids Store",
  "short_name": "Woky",
  "description": "Tienda de ropa para niños",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## 🚀 Comandos de Desarrollo

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Iniciar producción
npm start

# Linting
npm run lint

# Prisma Studio
npx prisma studio

# Generar tipos
npx prisma generate

# Migración
npx prisma migrate dev

# Seed
npm run seed
```

## 📦 Scripts Útiles

### Crear Usuario Admin
```bash
# En Prisma Studio o directamente:
npx prisma db seed
# O usar /api/auth/[...nextauth]/route.ts para registrar
```

### Backup de Base de Datos
```bash
# Exportar schema
npx prisma db pull

# Exportar datos
# Usar Neon dashboard o pg_dump
```

### Reset Completo
```bash
npx prisma migrate reset
npm run seed
```

---

**Última actualización:** 1 de Noviembre 2025
**Versión:** 1.0.3
