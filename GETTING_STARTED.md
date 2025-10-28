# 🎉 ¡Proyecto Creado Exitosamente!

Tu e-commerce **Woky Store** ha sido generado con todas las funcionalidades necesarias.

## 📦 Siguiente paso: Instalar dependencias

Ejecuta el siguiente comando para instalar todas las dependencias:

\`\`\`bash
npm install
\`\`\`

O si prefieres usar pnpm o yarn:

\`\`\`bash
# Con pnpm
pnpm install

# Con yarn
yarn install
\`\`\`

## ⚙️ Configuración rápida

### 1. Variables de entorno

Crea un archivo `.env` copiando `.env.example`:

\`\`\`bash
cp .env.example .env
\`\`\`

**Configura al menos estas variables críticas:**

\`\`\`env
# Base de datos (usa SQLite para empezar rápido)
DATABASE_URL="file:./dev.db"

# NextAuth (genera uno con: openssl rand -base64 32)
NEXTAUTH_SECRET="tu-secret-super-seguro-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Mercado Pago (obtén tus credenciales en developers.mercadopago.com)
MP_ACCESS_TOKEN="TEST-tu-access-token-de-mercadopago"

# UploadThing (opcional, regístrate en uploadthing.com)
UPLOADTHING_SECRET="sk_live_xxxxx"
UPLOADTHING_APP_ID="xxxxx"
\`\`\`

### 2. Inicializar base de datos

\`\`\`bash
# Generar cliente Prisma
npm run db:generate

# Crear tablas
npm run db:push

# Llenar con datos de prueba
npm run db:seed
\`\`\`

Esto creará:
- ✅ Usuario admin: `admin@woky.com` / `admin123`
- ✅ Usuario normal: `user@example.com` / `user123`
- ✅ 8 productos de ejemplo
- ✅ 4 categorías

### 3. Ejecutar en desarrollo

\`\`\`bash
npm run dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000) 🚀

## 🧪 Testing de pagos con Mercado Pago

### Webhook en desarrollo local

Para que funcione el webhook de Mercado Pago en tu localhost:

1. **Instala ngrok**:
   \`\`\`bash
   # Windows (con Chocolatey)
   choco install ngrok
   
   # Mac (con Homebrew)
   brew install ngrok/ngrok/ngrok
   
   # O descárgalo de: https://ngrok.com/download
   \`\`\`

2. **Expone tu localhost**:
   \`\`\`bash
   ngrok http 3000
   \`\`\`

3. **Copia la URL HTTPS** (ej: `https://abc123.ngrok.io`)

4. **Actualiza tu `.env`**:
   \`\`\`env
   PUBLIC_URL=https://abc123.ngrok.io
   NEXTAUTH_URL=https://abc123.ngrok.io
   \`\`\`

5. **Configura el webhook en Mercado Pago**:
   - Ve a [developers.mercadopago.com](https://developers.mercadopago.com/)
   - Webhooks → Nueva URL
   - URL: `https://abc123.ngrok.io/api/mp-webhook`
   - Eventos: **Pagos** y **Merchant Orders**

### Tarjetas de prueba (Sandbox)

- **Aprobada**: `5031 7557 3453 0604` | CVV: `123` | Exp: `11/25`
- **Rechazada**: `5031 4332 1540 6351` | CVV: `123` | Exp: `11/25`

[Más tarjetas de prueba aquí](https://www.mercadopago.com.ar/developers/es/docs/testing/test-cards)

## 🛠️ Comandos útiles

\`\`\`bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run start        # Servidor producción
npm run lint         # Linter
npm run format       # Formatear código
npm run db:studio    # Abrir Prisma Studio
npm run test         # Tests con Playwright
\`\`\`

## 📂 Estructura del proyecto

\`\`\`
app/
├── (store)/         # Tienda pública
├── (admin)/         # Panel admin (protegido)
├── (auth)/          # Login/Registro
└── api/             # API routes

components/          # Componentes React
lib/                 # Utilidades y configuración
prisma/             # Schema y migrations
\`\`\`

## 🎨 Personalización

- **Logo**: Reemplaza los archivos en `public/`
- **Colores**: Edita `app/globals.css` y `tailwind.config.ts`
- **Productos**: Edita `prisma/seed.ts` y ejecuta `npm run db:seed`

## 🔐 Panel de administración

Accede a `/admin` con el usuario admin:

- Email: `admin@woky.com`
- Password: `admin123`

## 📚 Documentación completa

Lee el archivo **README.md** para información detallada sobre:

- Arquitectura del proyecto
- Seguridad
- Deploy en Vercel
- Configuración de producción
- Troubleshooting

## ✨ Features incluidas

✅ Autenticación con NextAuth (roles, OAuth, 2FA)
✅ Pagos con Mercado Pago (webhook verificado)
✅ Panel de administración completo
✅ Dark mode
✅ Responsive design
✅ SEO optimizado
✅ PWA ready
✅ Typescript + ESLint + Prettier

---

**¿Necesitas ayuda?** Consulta el README.md o abre un issue.

**¡Feliz coding! 🚀**
