# 🚀 Guía de Despliegue - Woky Kids

## Opción 1: Vercel (RECOMENDADO) ⭐

Vercel es la mejor opción para Next.js ya que:
- ✅ Soporte completo para Next.js 15
- ✅ Deploy automático desde GitHub
- ✅ Dominio gratis (.vercel.app)
- ✅ SSL gratis
- ✅ Plan gratuito generoso

### Pasos para desplegar en Vercel:

1. **Crea una cuenta en Vercel**
   - Ve a https://vercel.com
   - Regístrate con tu cuenta de GitHub

2. **Sube tu proyecto a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Woky Kids Store"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/woky-kids.git
   git push -u origin main
   ```

3. **Importa el proyecto en Vercel**
   - Ve a https://vercel.com/new
   - Selecciona tu repositorio de GitHub
   - Vercel detectará automáticamente Next.js

4. **Configura las variables de entorno**
   En el dashboard de Vercel, agrega estas variables:
   
   ```
   DATABASE_URL=tu_url_de_postgresql_en_la_nube
   AUTH_SECRET=genera_uno_nuevo_con_openssl_rand_-base64_32
   NEXTAUTH_URL=https://tu-proyecto.vercel.app
   
   # Mercado Pago (producción)
   MERCADO_PAGO_ACCESS_TOKEN=tu_token_de_produccion
   MERCADO_PAGO_PUBLIC_KEY=tu_public_key_de_produccion
   
   # UploadThing (opcional)
   UPLOADTHING_SECRET=tu_uploadthing_secret
   UPLOADTHING_APP_ID=tu_uploadthing_app_id
   
   # OAuth (opcional)
   AUTH_GOOGLE_ID=tu_google_client_id
   AUTH_GOOGLE_SECRET=tu_google_client_secret
   AUTH_GITHUB_ID=tu_github_client_id
   AUTH_GITHUB_SECRET=tu_github_client_secret
   ```

5. **Configura la base de datos en la nube**
   
   Opciones recomendadas:
   
   **A) Neon (PostgreSQL gratis):**
   - Ve a https://neon.tech
   - Crea una cuenta gratis
   - Crea un proyecto
   - Copia la connection string
   - Pégala en DATABASE_URL en Vercel
   
   **B) Supabase (PostgreSQL gratis):**
   - Ve a https://supabase.com
   - Crea proyecto
   - En Settings > Database > Connection string
   - Copia y pega en DATABASE_URL

   **C) PlanetScale (MySQL gratis):**
   - Ve a https://planetscale.com
   - Crea base de datos
   - Copia connection string

6. **Actualiza el schema de Prisma para producción**
   
   En `prisma/schema.prisma`, cambia:
   ```prisma
   datasource db {
     provider = "postgresql"  // Cambia de "sqlite" a "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

7. **Ejecuta las migraciones en producción**
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

8. **Deploy!**
   - Haz push a GitHub
   - Vercel desplegará automáticamente
   - Tu sitio estará en: https://tu-proyecto.vercel.app

---

## Opción 2: Railway 🚂

Railway es otra excelente opción con base de datos incluida:

1. Ve a https://railway.app
2. Conecta con GitHub
3. "New Project" > "Deploy from GitHub repo"
4. Selecciona tu repositorio
5. Railway detectará Next.js automáticamente
6. Agrega un servicio PostgreSQL
7. Railway configurará DATABASE_URL automáticamente

---

## Opción 3: Netlify (LIMITADO) ⚠️

**NOTA:** Netlify tiene limitaciones con Next.js:
- ❌ No soporta todas las features de Next.js 15
- ❌ Server Actions tienen limitaciones
- ❌ Requiere adaptador especial
- ⚠️ No recomendado para este proyecto

Si aún así quieres usar Netlify:

1. Instala el plugin:
   ```bash
   npm install @netlify/plugin-nextjs --legacy-peer-deps
   ```

2. Crea `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

3. Sube a GitHub y conecta con Netlify
4. Agrega variables de entorno en Netlify

---

## 📋 Checklist Pre-Deploy

- [ ] Base de datos en la nube configurada (Neon/Supabase/PlanetScale)
- [ ] Schema de Prisma actualizado a PostgreSQL/MySQL
- [ ] Migraciones ejecutadas en producción
- [ ] Variables de entorno configuradas
- [ ] AUTH_SECRET generado (usa: `openssl rand -base64 32`)
- [ ] Mercado Pago en modo producción (no sandbox)
- [ ] Tokens de producción de Mercado Pago
- [ ] Proyecto subido a GitHub
- [ ] .gitignore incluye .env y node_modules

---

## 🔒 Seguridad

**¡NUNCA subas estos archivos a GitHub!**
- `.env`
- `.env.local`
- `prisma/dev.db`
- Verifica que `.gitignore` los incluya

---

## 🆘 Troubleshooting

### Error: "Module not found"
```bash
npm install --legacy-peer-deps
```

### Error: "Database connection failed"
- Verifica DATABASE_URL en variables de entorno
- Asegúrate que la base de datos esté activa
- Ejecuta las migraciones: `npx prisma migrate deploy`

### Error: "Auth session error"
- Verifica que AUTH_SECRET esté configurado
- NEXTAUTH_URL debe coincidir con tu dominio de producción

### Build error en Vercel
- Revisa los logs en Vercel dashboard
- Asegúrate que todas las dependencias estén en package.json
- Usa `--legacy-peer-deps` en installCommand

---

## 📚 Recursos

- [Documentación Vercel](https://vercel.com/docs)
- [Documentación Neon](https://neon.tech/docs)
- [Documentación Prisma Deploy](https://www.prisma.io/docs/guides/deployment)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

## ✅ Recomendación Final

**Para Woky Kids, usa esta combinación:**
- 🚀 **Vercel** para hosting (gratis)
- 🐘 **Neon** para PostgreSQL (gratis)
- 📦 **UploadThing** para imágenes (gratis)
- 💳 **Mercado Pago** para pagos

¡Tu tienda estará online en menos de 10 minutos!
