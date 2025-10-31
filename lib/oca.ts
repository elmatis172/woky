import { env } from './env'

// Tipos de operativa OCA
export enum OCAOperativa {
  PUERTA_A_PUERTA = 64665,
  PUERTA_A_SUCURSAL = 62342,
  SUCURSAL_A_PUERTA = 94584,
  SUCURSAL_A_SUCURSAL = 78254,
}

interface OCAQuoteParams {
  cuit: string
  operativa: OCAOperativa
  pesoTotal: number // en kg
  volumenTotal: number // en m³
  codigoPostalOrigen: string
  codigoPostalDestino: string
  cantidadPaquetes: number
  valorDeclarado: number // valor monetario
}

interface OCAQuoteResponse {
  Tarifador: {
    Precio: number
    Plazo: string
    Adicional: number
    Total: number
  }[]
}

interface ShippingOption {
  id: string
  name: string
  type: string
  cost: number
  estimatedDays: string | null
  isMercadoEnvios: boolean
  isOCA?: boolean
  provinces: string | null
  minAmount: number | null
  maxAmount: number | null
}

/**
 * Calcula el volumen en m³ a partir de dimensiones en cm
 */
function calculateVolume(width: number, height: number, length: number): number {
  // Convertir de cm³ a m³
  const volumeCm3 = width * height * length
  const volumeM3 = volumeCm3 / 1000000
  return volumeM3
}

/**
 * Calcula tarifas de envío con OCA
 */
export async function calculateOCAShipping(params: {
  items: Array<{
    weight?: number | null // en gramos
    width?: number | null // en cm
    height?: number | null // en cm
    length?: number | null // en cm
    price: number // en centavos
    quantity: number
  }>
  zipCode: string
  originZipCode?: string
}): Promise<ShippingOption[]> {
  const { items, zipCode, originZipCode = '1602' } = params

  // Verificar credenciales OCA
  const ocaCuit = process.env.OCA_CUIT
  const ocaTestMode = process.env.OCA_TEST_MODE === 'true'

  if (!ocaCuit) {
    console.log('⚠️ OCA_CUIT no configurado, saltando OCA shipping')
    return []
  }

  // Filtrar items con dimensiones completas
  const itemsWithDimensions = items.filter(
    item =>
      item.weight &&
      item.width &&
      item.height &&
      item.length &&
      item.weight > 0 &&
      item.width > 0 &&
      item.height > 0 &&
      item.length > 0
  )

  if (itemsWithDimensions.length === 0) {
    console.log('⚠️ No hay productos con dimensiones completas para OCA')
    return []
  }

  // Calcular totales
  const pesoTotal = itemsWithDimensions.reduce(
    (sum, item) => sum + (item.weight! / 1000) * item.quantity, // gramos a kg
    0
  )

  const volumenTotal = itemsWithDimensions.reduce(
    (sum, item) =>
      sum +
      calculateVolume(item.width!, item.height!, item.length!) * item.quantity,
    0
  )

  const valorDeclarado = Math.round(
    items.reduce((sum, item) => sum + (item.price / 100) * item.quantity, 0) // centavos a pesos
  )

  const cantidadPaquetes = items.reduce((sum, item) => sum + item.quantity, 0)

  // Endpoint según ambiente
  const baseUrl = ocaTestMode
    ? 'http://webservice.oca.com.ar/ePak_Tracking_TEST'
    : 'http://webservice.oca.com.ar/ePak_tracking'

  const endpoint = `${baseUrl}/Oep_TrackEPak.asmx/Tarifar_Envio_Corporativo`

  const shippingOptions: ShippingOption[] = []

  // Cotizar para diferentes operativas
  const operativas = [
    { tipo: OCAOperativa.PUERTA_A_PUERTA, nombre: 'OCA Puerta a Puerta' },
    { tipo: OCAOperativa.PUERTA_A_SUCURSAL, nombre: 'OCA Puerta a Sucursal' },
  ]

  for (const operativa of operativas) {
    try {
      const quoteParams: OCAQuoteParams = {
        cuit: ocaCuit,
        operativa: operativa.tipo,
        pesoTotal,
        volumenTotal,
        codigoPostalOrigen: originZipCode,
        codigoPostalDestino: zipCode,
        cantidadPaquetes,
        valorDeclarado,
      }

      console.log(`🔎 Cotizando OCA ${operativa.nombre}:`, {
        peso: `${pesoTotal.toFixed(2)} kg`,
        volumen: `${volumenTotal.toFixed(4)} m³`,
        paquetes: cantidadPaquetes,
        valor: `$${valorDeclarado}`,
        origen: originZipCode,
        destino: zipCode,
      })

      // Construir query string
      const queryParams = new URLSearchParams({
        Cuit: quoteParams.cuit,
        Operativa: quoteParams.operativa.toString(),
        PesoTotal: quoteParams.pesoTotal.toString(),
        VolumenTotal: quoteParams.volumenTotal.toString(),
        CodigoPostalOrigen: quoteParams.codigoPostalOrigen,
        CodigoPostalDestino: quoteParams.codigoPostalDestino,
        CantidadPaquetes: quoteParams.cantidadPaquetes.toString(),
        ValorDeclarado: quoteParams.valorDeclarado.toString(),
      })

      const response = await fetch(`${endpoint}?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      if (!response.ok) {
        console.error(
          `❌ Error en OCA ${operativa.nombre}:`,
          response.status,
          response.statusText
        )
        continue
      }

      const text = await response.text()
      console.log(`📦 Respuesta OCA ${operativa.nombre}:`, text.substring(0, 500))

      // Parsear XML response manualmente (simple regex para extraer valores)
      const precioMatch = text.match(/<Precio>([\d.]+)<\/Precio>/)
      const adicionalMatch = text.match(/<Adicional>([\d.]+)<\/Adicional>/)
      const totalMatch = text.match(/<Total>([\d.]+)<\/Total>/)
      const plazoMatch = text.match(/<Plazo>([^<]+)<\/Plazo>/)

      if (!totalMatch) {
        console.log(`⚠️ No se encontró precio total para ${operativa.nombre}`)
        continue
      }

      const costoTotal = parseFloat(totalMatch[1])
      const plazo = plazoMatch ? plazoMatch[1] : null

      shippingOptions.push({
        id: `oca-${operativa.tipo}`,
        name: operativa.nombre,
        type: 'OCA',
        cost: Math.round(costoTotal * 100), // pesos a centavos
        estimatedDays: plazo || null,
        isMercadoEnvios: false,
        isOCA: true,
        provinces: null,
        minAmount: null,
        maxAmount: null,
      })

      console.log(`✅ Tarifa OCA ${operativa.nombre}: $${costoTotal}`)
    } catch (error) {
      console.error(`❌ Error cotizando OCA ${operativa.nombre}:`, error)
    }
  }

  return shippingOptions
}
