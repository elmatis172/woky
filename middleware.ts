import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // El middleware ahora solo verifica la ruta
  // La autenticación se maneja en cada página del admin
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
