# 🛍️ Woky Store - E-commerce Moderno con Mercado Pago

E-commerce completo desarrollado con Next.js 15, TypeScript, Prisma, NextAuth y Mercado Pago. Incluye panel de administración completo y diseño de última generación.

## ✨ Características

- 🎨 **Diseño moderno**: UI con Tailwind CSS, shadcn/ui y Framer Motion
- 🌙 **Dark Mode**: Soporte completo para tema claro/oscuro
- 🔐 **Autenticación**: NextAuth con roles (ADMIN/USER), OAuth y 2FA
- 💳 **Pagos**: Integración completa con Mercado Pago (Argentina)
- 📦 **Gestión de productos**: CRUD completo con imágenes, stock y variaciones
- 📊 **Panel Admin**: Dashboard profesional solo para administradores
- 🔒 **Seguridad**: CSP, validaciones, rate limiting, webhooks verificados
- 🚀 **Performance**: Server Components, optimización de imágenes, PWA
- ♿ **Accesibilidad**: WCAG AA, navegación por teclado, ARIA
- 🌐 **SEO**: Metadata dinámica, sitemap, robots.txt

## 📋 Prerequisitos

- **Node.js** 18+ y npm/pnpm/yarn
- **PostgreSQL** (o SQLite para desarrollo rápido)
- **Cuenta de Mercado Pago** (Argentina)
- **UploadThing** o **Cloudinary** (para imágenes)
- **(Opcional)** ngrok para testing de webhooks en local

## 🚀 Instalación

### 1. Clonar y instalar dependencias

\`\`\`bash
# Clonar el repositorio
git clone <tu-repo>
cd PAGINAWOKY

# Instalar dependencias
npm install
\`\`\`

### 2. Configurar variables de entorno

Copia el archivo \`.env.example\` a \`.env\` y completa las variables:

\`\`\`bash
cp .env.example .env
\`\`\`

**Variables críticas:**

\`\`\`env
# App
NODE_ENV=development
PUBLIC_URL=http://localhost:3000  # Cambiar en producción

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/woky_db"
# O SQLite para desarrollo:
# DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-muy-seguro-generado-con-openssl

# Mercado Pago
MP_ACCESS_TOKEN=APP_USR-tu-access-token-de-mercadopago
MP_PUBLIC_KEY=APP_USR-tu-public-key  # (opcional)

# UploadThing (para imágenes)
UPLOADTHING_SECRET=sk_live_xxxxx
UPLOADTHING_APP_ID=xxxxx
\`\`\`

### 3. Configurar Mercado Pago

1. **Crear cuenta**: Ve a [developers.mercadopago.com](https://developers.mercadopago.com/)
2. **Obtener credenciales**: En "Credenciales" copia tu **Access Token** (modo Sandbox para testing)
3. **Configurar webhook**:
   - En desarrollo: usa **ngrok** para exponer tu localhost
   \`\`\`bash
   ngrok http 3000
   # Copia la URL https://xxxx.ngrok.io
   \`\`\`
   - En Mercado Pago: Configura el webhook en `https://tu-url.ngrok.io/api/mp-webhook`
   - Selecciona eventos: **Pagos** y **Merchant Orders**

### 4. Configurar base de datos

\`\`\`bash
# Generar cliente de Prisma
npm run db:generate

# Crear tablas
npm run db:push
# O con migraciones:
npm run db:migrate

# Seed con datos de prueba
npm run db:seed
\`\`\`

Esto creará:
- Usuario admin: \`admin@woky.com\` / \`admin123\`
- Usuario normal: \`user@example.com\` / \`user123\`
- 8 productos de ejemplo
- 4 categorías

### 5. Ejecutar en desarrollo

\`\`\`bash
npm run dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del Proyecto

\`\`\`
PAGINAWOKY/
├── app/
│   ├── (store)/                 # Tienda pública
│   │   ├── page.tsx            # Home
│   │   ├── productos/          # Listado y detalle
│   │   ├── carrito/            # Carrito
│   │   ├── checkout/           # Checkout
│   │   └── ok/                 # Página de éxito
│   ├── (admin)/                # Panel admin (protegido)
│   │   ├── dashboard/
│   │   ├── productos/          # CRUD productos
│   │   ├── categorias/
│   │   ├── pedidos/
│   │   └── usuarios/
│   ├── (auth)/                 # Login/Registro
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── api/
│   │   ├── mp/                 # Crear preferencia MP
│   │   ├── mp-webhook/         # Webhook MP
│   │   └── auth/[...nextauth]/ # NextAuth
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── navbar.tsx
│   ├── footer.tsx
│   ├── product-card.tsx
│   └── ...
├── lib/
│   ├── db.ts                   # Prisma client
│   ├── auth.ts                 # NextAuth config
│   ├── mp.ts                   # Mercado Pago
│   ├── env.ts                  # Validación env vars
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── middleware.ts               # Protección de rutas
└── package.json
\`\`\`

## 🔐 Usuarios de Prueba

Después del seed:

- **Admin**: \`admin@woky.com\` / \`admin123\`
- **Usuario**: \`user@example.com\` / \`user123\`

## 💳 Flujo de Pago

1. Usuario agrega productos al carrito
2. En checkout, se crea una orden \`PENDING\` en DB
3. Se genera una **preferencia** de Mercado Pago
4. Usuario es redirigido a Mercado Pago
5. Completa el pago (tarjeta de prueba MP)
6. Mercado Pago notifica via **webhook**
7. Backend **consulta el pago** a la API de MP (seguridad)
8. Si aprobado: orden → \`PAID\`, se decrementa stock
9. Usuario es redirigido a página de éxito

### Tarjetas de Prueba (Sandbox)

- **Aprobado**: 5031 7557 3453 0604, CVV: 123, Exp: 11/25
- **Rechazado**: 5031 4332 1540 6351, CVV: 123, Exp: 11/25

Más en: [mercadopago.com.ar/developers/es/docs/testing](https://www.mercadopago.com.ar/developers/es/docs/testing/test-cards)

## 🛠️ Comandos Útiles

\`\`\`bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Build para producción
npm run start            # Servidor de producción
npm run lint             # Linter
npm run format           # Formatear código

# Base de datos
npm run db:generate      # Generar cliente Prisma
npm run db:push          # Sincronizar schema (dev)
npm run db:migrate       # Crear migración
npm run db:seed          # Seed con datos de prueba
npm run db:studio        # Abrir Prisma Studio

# Testing
npm run test             # Ejecutar tests
npm run test:ui          # Tests con UI
\`\`\`

## 🔒 Seguridad

- ✅ Variables de entorno validadas con Zod
- ✅ Webhooks verificados consultando a MP
- ✅ Orden idempotente (no duplicar pagos)
- ✅ Headers de seguridad (CSP, HSTS, X-Frame-Options)
- ✅ Cookies \`HttpOnly\`, \`Secure\`, \`SameSite\`
- ✅ Rate limiting en APIs sensibles (opcional con Upstash)
- ✅ Sin datos de tarjeta en logs ni DB
- ✅ Roles y permisos (middleware)

## 🚀 Deploy

### Vercel (Recomendado)

1. Sube el proyecto a GitHub
2. Importa en [vercel.com](https://vercel.com)
3. Configura variables de entorno
4. Conecta base de datos (Vercel Postgres, Neon, Supabase)
5. Actualiza \`PUBLIC_URL\` y \`NEXTAUTH_URL\`
6. Configura webhook de MP con tu dominio

### Variables de entorno en producción

- \`PUBLIC_URL\`: Tu dominio (ej: \`https://woky-store.vercel.app\`)
- \`MP_ACCESS_TOKEN\`: Token de **producción** de Mercado Pago
- \`DATABASE_URL\`: URL de tu base de datos en producción
- \`NEXTAUTH_SECRET\`: Genera uno nuevo con \`openssl rand -base64 32\`

## 📊 Panel de Administración

Accede a [http://localhost:3000/admin](http://localhost:3000/admin) con el usuario admin.

**Funcionalidades:**
- Dashboard con métricas
- CRUD completo de productos (nombre, precio, stock, imágenes, categoría, atributos)
- Gestión de categorías
- Órdenes: ver, filtrar, exportar CSV
- Usuarios: cambiar roles, bloquear
- Logs de auditoría

## 🎨 Personalización

### Colores y tema

Edita \`app/globals.css\` y \`tailwind.config.ts\` para cambiar el color primario y otros estilos.

### Logo

Reemplaza los archivos en \`public/\` y actualiza el componente \`Navbar\`.

## 🐛 Troubleshooting

### Webhook no funciona en local

- Usa **ngrok**: \`ngrok http 3000\`
- Copia la URL HTTPS
- Configúrala en Mercado Pago
- Actualiza \`PUBLIC_URL\` en \`.env\`

### Error de autenticación

- Verifica que \`NEXTAUTH_SECRET\` esté configurado
- Regenera con \`openssl rand -base64 32\`

### Productos no aparecen

- Verifica que el status sea \`PUBLISHED\`
- Ejecuta el seed: \`npm run db:seed\`

## 📝 TODO / Mejoras Futuras

- [ ] Sistema de cupones y descuentos
- [ ] Envíos: zonas, costos, tracking
- [ ] Facturación electrónica (AFIP WSFEv1)
- [ ] Reseñas de productos con moderación
- [ ] Notificaciones por email (Resend, SendGrid)
- [ ] Analytics (Plausible, GA4)
- [ ] Búsqueda avanzada con filtros
- [ ] Wishlist / Favoritos
- [ ] Comparador de productos
- [ ] Multi-idioma (i18n)

## 📄 Licencia

MIT

## 🤝 Contribuir

Pull requests son bienvenidos. Para cambios importantes, abre un issue primero.

---

**Desarrollado con ❤️ para la comunidad**
