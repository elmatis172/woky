// Datos de provincias y localidades de Argentina
// Fuente: INDEC y Correo Argentino

export interface Location {
  name: string;
  zipCode: string; // Código postal representativo
}

export interface Province {
  name: string;
  code: string;
  locations: Location[];
}

export const provinces: Province[] = [
  {
    name: "Buenos Aires",
    code: "BA",
    locations: [
      { name: "La Plata", zipCode: "1900" },
      { name: "Mar del Plata", zipCode: "7600" },
      { name: "Bahía Blanca", zipCode: "8000" },
      { name: "San Isidro", zipCode: "1642" },
      { name: "Vicente López", zipCode: "1602" },
      { name: "San Martín", zipCode: "1650" },
      { name: "Quilmes", zipCode: "1878" },
      { name: "Lanús", zipCode: "1824" },
      { name: "Avellaneda", zipCode: "1870" },
      { name: "Lomas de Zamora", zipCode: "1832" },
      { name: "Morón", zipCode: "1708" },
      { name: "Tigre", zipCode: "1648" },
      { name: "Pilar", zipCode: "1629" },
      { name: "Escobar", zipCode: "1625" },
      { name: "Zárate", zipCode: "2800" },
      { name: "Campana", zipCode: "2804" },
      { name: "Luján", zipCode: "6700" },
      { name: "Mercedes", zipCode: "6600" },
      { name: "Pergamino", zipCode: "2700" },
      { name: "Junín", zipCode: "6000" },
      { name: "Tandil", zipCode: "7000" },
      { name: "Olavarría", zipCode: "7400" },
      { name: "Azul", zipCode: "7300" },
      { name: "Tres Arroyos", zipCode: "7500" },
      { name: "Necochea", zipCode: "7630" },
      { name: "Balcarce", zipCode: "7620" },
      { name: "Chascomús", zipCode: "7130" },
      { name: "Dolores", zipCode: "7100" },
      { name: "Cañuelas", zipCode: "1814" },
      { name: "San Vicente", zipCode: "1865" },
    ],
  },
  {
    name: "Ciudad Autónoma de Buenos Aires",
    code: "CABA",
    locations: [
      { name: "Palermo", zipCode: "1425" },
      { name: "Belgrano", zipCode: "1426" },
      { name: "Recoleta", zipCode: "1113" },
      { name: "Caballito", zipCode: "1406" },
      { name: "Núñez", zipCode: "1429" },
      { name: "Villa Urquiza", zipCode: "1431" },
      { name: "Flores", zipCode: "1406" },
      { name: "Almagro", zipCode: "1172" },
      { name: "San Telmo", zipCode: "1098" },
      { name: "Puerto Madero", zipCode: "1107" },
      { name: "Microcentro", zipCode: "1043" },
      { name: "Once", zipCode: "1183" },
      { name: "Constitución", zipCode: "1289" },
      { name: "Villa Crespo", zipCode: "1414" },
      { name: "Barracas", zipCode: "1280" },
    ],
  },
  {
    name: "Córdoba",
    code: "CB",
    locations: [
      { name: "Córdoba Capital", zipCode: "5000" },
      { name: "Villa Carlos Paz", zipCode: "5152" },
      { name: "Río Cuarto", zipCode: "5800" },
      { name: "Villa María", zipCode: "5900" },
      { name: "Alta Gracia", zipCode: "5186" },
      { name: "Bell Ville", zipCode: "2550" },
      { name: "San Francisco", zipCode: "2400" },
      { name: "Cruz del Eje", zipCode: "5280" },
    ],
  },
  {
    name: "Santa Fe",
    code: "SF",
    locations: [
      { name: "Rosario", zipCode: "2000" },
      { name: "Santa Fe Capital", zipCode: "3000" },
      { name: "Rafaela", zipCode: "2300" },
      { name: "Venado Tuerto", zipCode: "2600" },
      { name: "Reconquista", zipCode: "3560" },
    ],
  },
  {
    name: "Mendoza",
    code: "MZ",
    locations: [
      { name: "Mendoza Capital", zipCode: "5500" },
      { name: "San Rafael", zipCode: "5600" },
      { name: "Godoy Cruz", zipCode: "5501" },
      { name: "Luján de Cuyo", zipCode: "5507" },
      { name: "Maipú", zipCode: "5515" },
    ],
  },
  {
    name: "Tucumán",
    code: "TM",
    locations: [
      { name: "San Miguel de Tucumán", zipCode: "4000" },
      { name: "Yerba Buena", zipCode: "4107" },
      { name: "Tafí Viejo", zipCode: "4103" },
      { name: "Concepción", zipCode: "4146" },
    ],
  },
  {
    name: "Salta",
    code: "SA",
    locations: [
      { name: "Salta Capital", zipCode: "4400" },
      { name: "Orán", zipCode: "4530" },
      { name: "Tartagal", zipCode: "4560" },
      { name: "Metán", zipCode: "4440" },
    ],
  },
  {
    name: "Entre Ríos",
    code: "ER",
    locations: [
      { name: "Paraná", zipCode: "3100" },
      { name: "Concordia", zipCode: "3200" },
      { name: "Gualeguaychú", zipCode: "2820" },
      { name: "Concepción del Uruguay", zipCode: "3260" },
    ],
  },
  {
    name: "Chaco",
    code: "CC",
    locations: [
      { name: "Resistencia", zipCode: "3500" },
      { name: "Presidencia Roque Sáenz Peña", zipCode: "3700" },
      { name: "Villa Ángela", zipCode: "3540" },
    ],
  },
  {
    name: "Corrientes",
    code: "CR",
    locations: [
      { name: "Corrientes Capital", zipCode: "3400" },
      { name: "Goya", zipCode: "3450" },
      { name: "Paso de los Libres", zipCode: "3230" },
      { name: "Curuzú Cuatiá", zipCode: "3460" },
    ],
  },
  {
    name: "Misiones",
    code: "MN",
    locations: [
      { name: "Posadas", zipCode: "3300" },
      { name: "Eldorado", zipCode: "3380" },
      { name: "Oberá", zipCode: "3360" },
      { name: "Puerto Iguazú", zipCode: "3370" },
    ],
  },
  {
    name: "Jujuy",
    code: "JY",
    locations: [
      { name: "San Salvador de Jujuy", zipCode: "4600" },
      { name: "San Pedro", zipCode: "4500" },
      { name: "Libertador General San Martín", zipCode: "4512" },
      { name: "Palpala", zipCode: "4612" },
    ],
  },
  {
    name: "Santiago del Estero",
    code: "SE",
    locations: [
      { name: "Santiago del Estero Capital", zipCode: "4200" },
      { name: "La Banda", zipCode: "4300" },
      { name: "Termas de Río Hondo", zipCode: "4220" },
      { name: "Frías", zipCode: "4230" },
    ],
  },
  {
    name: "Formosa",
    code: "FO",
    locations: [
      { name: "Formosa Capital", zipCode: "3600" },
      { name: "Clorinda", zipCode: "3610" },
      { name: "Pirané", zipCode: "3606" },
    ],
  },
  {
    name: "Catamarca",
    code: "CT",
    locations: [
      { name: "San Fernando del Valle de Catamarca", zipCode: "4700" },
      { name: "Andalgalá", zipCode: "4740" },
      { name: "Belén", zipCode: "4750" },
    ],
  },
  {
    name: "La Rioja",
    code: "LR",
    locations: [
      { name: "La Rioja Capital", zipCode: "5300" },
      { name: "Chilecito", zipCode: "5360" },
      { name: "Aimogasta", zipCode: "5310" },
    ],
  },
  {
    name: "San Juan",
    code: "SJ",
    locations: [
      { name: "San Juan Capital", zipCode: "5400" },
      { name: "Chimbas", zipCode: "5413" },
      { name: "Rawson", zipCode: "5425" },
      { name: "Pocito", zipCode: "5427" },
    ],
  },
  {
    name: "San Luis",
    code: "SL",
    locations: [
      { name: "San Luis Capital", zipCode: "5700" },
      { name: "Villa Mercedes", zipCode: "5730" },
      { name: "Merlo", zipCode: "5881" },
    ],
  },
  {
    name: "La Pampa",
    code: "LP",
    locations: [
      { name: "Santa Rosa", zipCode: "6300" },
      { name: "General Pico", zipCode: "6360" },
      { name: "Realicó", zipCode: "6200" },
    ],
  },
  {
    name: "Neuquén",
    code: "NQ",
    locations: [
      { name: "Neuquén Capital", zipCode: "8300" },
      { name: "San Martín de los Andes", zipCode: "8370" },
      { name: "Villa La Angostura", zipCode: "8407" },
      { name: "Zapala", zipCode: "8340" },
    ],
  },
  {
    name: "Río Negro",
    code: "RN",
    locations: [
      { name: "Viedma", zipCode: "8500" },
      { name: "San Carlos de Bariloche", zipCode: "8400" },
      { name: "General Roca", zipCode: "8332" },
      { name: "Cipolletti", zipCode: "8324" },
    ],
  },
  {
    name: "Chubut",
    code: "CH",
    locations: [
      { name: "Rawson", zipCode: "9103" },
      { name: "Comodoro Rivadavia", zipCode: "9000" },
      { name: "Puerto Madryn", zipCode: "9120" },
      { name: "Trelew", zipCode: "9100" },
      { name: "Esquel", zipCode: "9200" },
    ],
  },
  {
    name: "Santa Cruz",
    code: "SC",
    locations: [
      { name: "Río Gallegos", zipCode: "9400" },
      { name: "Caleta Olivia", zipCode: "9011" },
      { name: "El Calafate", zipCode: "9405" },
      { name: "Pico Truncado", zipCode: "9015" },
    ],
  },
  {
    name: "Tierra del Fuego",
    code: "TF",
    locations: [
      { name: "Ushuaia", zipCode: "9410" },
      { name: "Río Grande", zipCode: "9420" },
      { name: "Tolhuin", zipCode: "9412" },
    ],
  },
];

// Función helper para obtener localidades por provincia
export function getLocationsByProvince(provinceName: string): Location[] {
  const province = provinces.find(p => p.name === provinceName);
  return province?.locations || [];
}

// Función helper para obtener código postal sugerido
export function getZipCodeForLocation(provinceName: string, locationName: string): string | null {
  const province = provinces.find(p => p.name === provinceName);
  if (!province) return null;
  
  const location = province.locations.find(l => l.name === locationName);
  return location?.zipCode || null;
}
