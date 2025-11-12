import { NextRequest, NextResponse } from "next/server";
import { trackShipNowShipment } from "@/lib/shipnow";

/**
 * Trackear envío de ShipNow
 * GET /api/shipping/shipnow/track?trackingNumber=XXX
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const trackingNumber = searchParams.get("trackingNumber");

    if (!trackingNumber) {
      return NextResponse.json(
        { error: "Número de tracking es requerido" },
        { status: 400 }
      );
    }

    console.log("🔍 Tracking ShipNow:", trackingNumber);
    
    const trackingResponse = await trackShipNowShipment(trackingNumber);

    if (!trackingResponse.success) {
      return NextResponse.json(
        { error: trackingResponse.error || "Error obteniendo tracking" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tracking: trackingResponse.tracking,
    });
  } catch (error) {
    console.error("❌ Error en /api/shipping/shipnow/track:", error);
    return NextResponse.json(
      { 
        error: "Error al obtener tracking",
        details: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    );
  }
}
