// Configuración de variables de entorno
// Este archivo valida y exporta las variables de entorno necesarias

function getEnvVar(key: string, required = true): string {
  const value = process.env[key];
  
  if (!value && required) {
    throw new Error(`❌ Falta la variable de entorno: ${key}`);
  }
  
  return value || "";
}

export const env = {
  // Mercado Pago
  MP_ACCESS_TOKEN: getEnvVar("MP_ACCESS_TOKEN", false),
  MP_PUBLIC_KEY: getEnvVar("MP_PUBLIC_KEY", false),
  
  // Base de datos
  DATABASE_URL: getEnvVar("DATABASE_URL"),
  
  // NextAuth
  NEXTAUTH_URL: getEnvVar("NEXTAUTH_URL"),
  NEXTAUTH_SECRET: getEnvVar("NEXTAUTH_SECRET"),
  
  // Modo de desarrollo
  NODE_ENV: process.env.NODE_ENV || "development",
  
  // UploadThing
  UPLOADTHING_SECRET: getEnvVar("UPLOADTHING_SECRET", false),
  UPLOADTHING_APP_ID: getEnvVar("UPLOADTHING_APP_ID", false),
} as const;

// Validar configuración de Mercado Pago al inicio (solo warning)
if (!env.MP_ACCESS_TOKEN || env.MP_ACCESS_TOKEN === "your-mercadopago-access-token-here") {
  console.warn("⚠️ MP_ACCESS_TOKEN no configurado - Mercado Envíos no estará disponible");
}

if (!env.MP_PUBLIC_KEY || env.MP_PUBLIC_KEY === "your-mercadopago-public-key-here") {
  console.warn("⚠️ MP_PUBLIC_KEY no configurado - Mercado Pago no estará disponible");
}
