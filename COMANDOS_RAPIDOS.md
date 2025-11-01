# 🚀 Guía Rápida de Comandos - Woky Kids Store

## 📋 Setup Inicial en Nueva Computadora

### 1. Pre-requisitos
```bash
# Verificar versiones
node --version  # debe ser >= 18.17.0
npm --version   # debe ser >= 9.0.0
git --version

# Instalar globalmente (si es necesario)
npm install -g vercel
```

### 2. Clonar y Setup
```bash
# Clonar repositorio
git clone https://github.com/elmatis172/woky.git
cd woky

# Instalar dependencias
npm install --legacy-peer-deps

# Copiar variables de entorno
cp .env.example .env.local

# EDITAR .env.local con tus credenciales
code .env.local

# Generar Prisma Client
npx prisma generate

# Sincronizar schema con DB
npx prisma db push

# (Opcional) Poblar con datos de prueba
npm run seed

# Iniciar desarrollo
npm run dev
```

## 🔑 Generar Secretos

### NextAuth Secret
```bash
# Opción 1: OpenSSL
openssl rand -base64 32

# Opción 2: Node
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Opción 3: Online
# https://generate-secret.vercel.app/
```

### Hash de Password para Admin
```bash
# En Node.js
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('tu-password', 10))"
```

## 🗄️ Comandos de Base de Datos

### Prisma - Desarrollo
```bash
# Ver base de datos en UI
npx prisma studio

# Generar cliente después de cambios en schema
npx prisma generate

# Crear migración
npx prisma migrate dev --name descripcion_cambio

# Aplicar schema sin migración (desarrollo)
npx prisma db push

# Formatear schema.prisma
npx prisma format

# Validar schema
npx prisma validate

# Poblar con datos iniciales
npx prisma db seed
npm run seed  # alias
```

### Prisma - Producción
```bash
# Aplicar migraciones en producción
npx prisma migrate deploy

# Generar cliente en producción
npx prisma generate
```

### Reset y Limpieza
```bash
# CUIDADO: Borra TODA la data
npx prisma migrate reset

# Resetear y poblar
npx prisma migrate reset && npm run seed
```

### Inspeccionar Base de Datos
```bash
# Generar schema desde DB existente
npx prisma db pull

# Ver info de migraciones
npx prisma migrate status

# Ver SQL de migración
cat prisma/migrations/TIMESTAMP_nombre/migration.sql
```

## 📦 Comandos de Desarrollo

### Next.js
```bash
# Desarrollo (con hot reload)
npm run dev

# Build para producción
npm run build

# Iniciar build de producción localmente
npm run build && npm start

# Linting
npm run lint

# Linting con auto-fix
npm run lint -- --fix

# Type checking
npx tsc --noEmit
```

### Limpieza
```bash
# Limpiar cache de Next.js
rm -rf .next

# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Limpiar todo (Windows)
Remove-Item -Recurse -Force .next, node_modules
npm install --legacy-peer-deps
```

## 🚀 Deploy (Vercel)

### Setup Inicial
```bash
# Login en Vercel
vercel login

# Vincular proyecto (primera vez)
vercel

# O especificar proyecto
vercel --name woky-kids-store
```

### Deploy
```bash
# Deploy a preview
vercel

# Deploy a producción
vercel --prod

# Deploy con logs
vercel --prod --debug

# Ver logs de última deployment
vercel logs
```

### Variables de Entorno
```bash
# Agregar variable
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add MP_ACCESS_TOKEN production

# Listar variables
vercel env ls

# Remover variable
vercel env rm DATABASE_URL production

# Pull variables a .env.local
vercel env pull .env.local
```

### Info del Proyecto
```bash
# Ver info del proyecto
vercel inspect

# Ver deployments
vercel ls

# Ver dominios
vercel domains ls
```

## 🔧 Git Workflows

### Desarrollo Diario
```bash
# Ver cambios
git status

# Agregar cambios
git add .

# Commit
git commit -m "feat: descripción del cambio"

# Push (activa auto-deploy en Vercel)
git push origin main

# Ver historial
git log --oneline -10
```

### Tipos de Commits
```bash
feat: Nueva funcionalidad
fix: Corrección de bug
docs: Documentación
style: Formato, sin cambio de código
refactor: Refactorización
test: Agregar tests
chore: Mantenimiento
```

### Branches
```bash
# Crear branch para feature
git checkout -b feature/nueva-funcionalidad

# Trabajar en branch
git add .
git commit -m "feat: implementar X"
git push origin feature/nueva-funcionalidad

# Volver a main
git checkout main

# Merge (después de PR aprobado)
git pull origin main
```

### Deshacer Cambios
```bash
# Descartar cambios locales
git restore archivo.tsx

# Descartar TODOS los cambios
git restore .

# Volver al commit anterior
git reset --hard HEAD~1

# Volver a commit específico
git reset --hard abc1234
```

## 🔍 Debugging

### Logs de Desarrollo
```bash
# Ver logs de Next.js
npm run dev

# Ver logs detallados de Prisma
# Agregar en schema.prisma:
# generator client {
#   provider = "prisma-client-js"
#   previewFeatures = ["tracing"]
# }
```

### Logs de Producción (Vercel)
```bash
# Logs en tiempo real
vercel logs --follow

# Logs de deployment específico
vercel logs [deployment-url]

# Logs de función específica
vercel logs --filter=/api/mp
```

### Testing en Producción
```bash
# Abrir en navegador
vercel --prod --open

# Ver URL de preview
vercel

# Testing local de build
npm run build && npm start
```

## 📊 Scripts Personalizados

### Crear Usuario Admin
```typescript
// scripts/create-admin.ts
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

const email = "admin@woky.com";
const password = "admin123"; // CAMBIAR

const hash = await bcrypt.hash(password, 10);

await db.user.create({
  data: {
    email,
    password: hash,
    name: "Admin",
    role: "ADMIN",
  },
});

console.log("Admin creado:", email);
```

```bash
# Ejecutar
npx tsx scripts/create-admin.ts
```

### Migrar Datos
```typescript
// scripts/migrate-data.ts
import { db } from "@/lib/db";

// Ejemplo: Actualizar todos los precios
const products = await db.product.findMany();

for (const product of products) {
  await db.product.update({
    where: { id: product.id },
    data: {
      price: product.price * 100, // Convertir a centavos
    },
  });
}
```

### Backup de Productos
```typescript
// scripts/backup-products.ts
import { db } from "@/lib/db";
import fs from "fs";

const products = await db.product.findMany({
  include: {
    category: true,
    variants: true,
  },
});

fs.writeFileSync(
  "backup-products.json",
  JSON.stringify(products, null, 2)
);

console.log("Backup guardado:", products.length, "productos");
```

## 🧪 Testing

### Crear Orden de Prueba
```bash
# Usar Mercado Pago TEST
# Tarjetas de prueba: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/testing

# VISA Aprobada
Número: 4509 9535 6623 3704
CVV: 123
Vencimiento: 11/25

# Mastercard Rechazada
Número: 5031 7557 3453 0604
CVV: 123
Vencimiento: 11/25
```

### Testear Webhook Localmente
```bash
# Instalar ngrok
npm install -g ngrok

# Exponer puerto 3000
ngrok http 3000

# Copiar URL pública
# Configurar en Mercado Pago:
# https://abc123.ngrok.io/api/mp-webhook

# Ver requests en: http://localhost:4040
```

## 🔐 Seguridad

### Verificar Vulnerabilidades
```bash
# Auditoría de npm
npm audit

# Fix automático
npm audit fix

# Fix forzado (cuidado)
npm audit fix --force
```

### Actualizar Dependencias
```bash
# Ver outdated
npm outdated

# Actualizar patch versions
npm update

# Actualizar a latest (cuidado)
npx npm-check-updates -u
npm install --legacy-peer-deps
```

## 📱 PWA y Producción

### Verificar Build
```bash
# Build local
npm run build

# Analizar bundle
npm run build -- --profile

# Ver tamaño de bundles
du -sh .next/static/*
```

### Lighthouse Test
```bash
# Con Chrome DevTools
# 1. Abrir DevTools (F12)
# 2. Pestaña "Lighthouse"
# 3. Generate report

# O con CLI
npm install -g lighthouse
lighthouse https://tu-dominio.vercel.app --view
```

## 🎨 Desarrollo de UI

### Agregar Componente de shadcn/ui
```bash
# Ejemplo: agregar Dialog
npx shadcn-ui@latest add dialog

# Lista de componentes
npx shadcn-ui@latest add
```

### Tailwind IntelliSense
```bash
# En VS Code, instalar extensión:
# Tailwind CSS IntelliSense

# Verificar que funcione:
# - Autocomplete de clases
# - Hover para ver CSS
```

## 📚 Documentación

### Generar Docs de API
```bash
# Listar todas las rutas API
find app/api -name "route.ts" -type f

# Ver estructura
tree app/api
```

### TypeScript Docs
```bash
# Verificar tipos
npx tsc --noEmit

# Ver errores de tipos
npx tsc --noEmit --pretty
```

## 🆘 Troubleshooting Rápido

### "Module not found"
```bash
npx prisma generate
npm install --legacy-peer-deps
```

### "Database connection failed"
```bash
# Verificar .env.local
cat .env.local | grep DATABASE_URL

# Test conexión
npx prisma db pull
```

### "Build failed on Vercel"
```bash
# Ver logs
vercel logs

# Verificar env vars
vercel env ls

# Rebuild
vercel --prod --force
```

### "Port 3000 already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

## 📌 Atajos de VS Code

```bash
# Abrir proyecto
code .

# Abrir archivo
code archivo.tsx

# Buscar en archivos
Ctrl+Shift+F (Windows/Linux)
Cmd+Shift+F (Mac)

# Ir a archivo
Ctrl+P (Windows/Linux)
Cmd+P (Mac)

# Command Palette
Ctrl+Shift+P (Windows/Linux)
Cmd+Shift+P (Mac)
```

---

## 🎯 Checklist Rápido para Nueva PC

- [ ] Instalar Node.js (>= 18.17.0)
- [ ] Instalar Git
- [ ] Instalar VS Code
- [ ] Clonar repo: `git clone https://github.com/elmatis172/woky.git`
- [ ] `cd woky`
- [ ] `npm install --legacy-peer-deps`
- [ ] Crear `.env.local` con credenciales
- [ ] `npx prisma generate`
- [ ] `npx prisma db push`
- [ ] `npm run dev`
- [ ] Abrir http://localhost:3000
- [ ] Verificar que cargue correctamente
- [ ] Login con admin (si existe) o crear usuario
- [ ] Hacer un cambio de prueba
- [ ] `git add .` → `git commit` → `git push`
- [ ] Verificar deploy en Vercel

¡Listo para desarrollar! 🚀
