// Calles principales por ciudad (muestra expandida - se puede seguir creciendo)
// Fuente: OpenStreetMap y datos públicos

export interface Street {
  name: string;
  city: string;
  province: string;
  zipCode: string;
}

// Base de datos simplificada de calles principales
// En producción, esto vendría de una base de datos o API
export const popularStreets: Record<string, Street[]> = {
  // CIUDAD AUTÓNOMA DE BUENOS AIRES
  "Palermo": [
    { name: "Av. Santa Fe", city: "Palermo", province: "Ciudad Autónoma de Buenos Aires", zipCode: "1425" },
    { name: "Av. Córdoba", city: "Palermo", province: "Ciudad Autónoma de Buenos Aires", zipCode: "1414" },
    { name: "Av. Las Heras", city: "Palermo", province: "Ciudad Autónoma de Buenos Aires", zipCode: "1425" },
    { name: "Av. Libertador", city: "Palermo", province: "Ciudad Autónoma de Buenos Aires", zipCode: "1425" },
    { name: "Av. Scalabrini Ortiz", city: "Palermo", province: "Ciudad Autónoma de Buenos Aires", zipCode: "1414" },
    { name: "Av. Juan B. Justo", city: "Palermo", province: "Ciudad Autónoma de Buenos Aires", zipCode: "1414" },
  ],
  "Belgrano": [
    { name: "Av. Cabildo", city: "Belgrano", province: "Ciudad Autónoma de Buenos Aires", zipCode: "1426" },
    { name: "Av. del Libertador", city: "Belgrano", province: "Ciudad Autónoma de Buenos Aires", zipCode: "1426" },
    { name: "Av. Congreso", city: "Belgrano", province: "Ciudad Autónoma de Buenos Aires", zipCode: "1426" },
    { name: "Av. Monroe", city: "Belgrano", province: "Ciudad Autónoma de Buenos Aires", zipCode: "1428" },
  ],
  "Microcentro": [
    { name: "Av. Corrientes", city: "Microcentro", province: "Ciudad Autónoma de Buenos Aires", zipCode: "1043" },
    { name: "Florida", city: "Microcentro", province: "Ciudad Autónoma de Buenos Aires", zipCode: "1005" },
    { name: "Av. de Mayo", city: "Microcentro", province: "Ciudad Autónoma de Buenos Aires", zipCode: "1084" },
    { name: "Av. 9 de Julio", city: "Microcentro", province: "Ciudad Autónoma de Buenos Aires", zipCode: "1043" },
    { name: "San Martín", city: "Microcentro", province: "Ciudad Autónoma de Buenos Aires", zipCode: "1004" },
    { name: "Reconquista", city: "Microcentro", province: "Ciudad Autónoma de Buenos Aires", zipCode: "1003" },
  ],
  "Recoleta": [
    { name: "Av. Santa Fe", city: "Recoleta", province: "Ciudad Autónoma de Buenos Aires", zipCode: "1060" },
    { name: "Av. Callao", city: "Recoleta", province: "Ciudad Autónoma de Buenos Aires", zipCode: "1023" },
    { name: "Av. Pueyrredón", city: "Recoleta", province: "Ciudad Autónoma de Buenos Aires", zipCode: "1118" },
    { name: "Av. Las Heras", city: "Recoleta", province: "Ciudad Autónoma de Buenos Aires", zipCode: "1021" },
  ],
  "Caballito": [
    { name: "Av. Rivadavia", city: "Caballito", province: "Ciudad Autónoma de Buenos Aires", zipCode: "1406" },
    { name: "Av. Acoyte", city: "Caballito", province: "Ciudad Autónoma de Buenos Aires", zipCode: "1405" },
    { name: "Av. Díaz Vélez", city: "Caballito", province: "Ciudad Autónoma de Buenos Aires", zipCode: "1406" },
  ],
  
  // BUENOS AIRES - GBA ZONA NORTE
  "Vicente López": [
    { name: "Av. Maipú", city: "Vicente López", province: "Buenos Aires", zipCode: "1602" },
    { name: "Av. del Libertador", city: "Vicente López", province: "Buenos Aires", zipCode: "1602" },
    { name: "Florida", city: "Vicente López", province: "Buenos Aires", zipCode: "1602" },
  ],
  "San Isidro": [
    { name: "Av. del Libertador", city: "San Isidro", province: "Buenos Aires", zipCode: "1642" },
    { name: "Av. Centenario", city: "San Isidro", province: "Buenos Aires", zipCode: "1642" },
    { name: "Av. Santa Fe", city: "San Isidro", province: "Buenos Aires", zipCode: "1642" },
  ],
  "Olivos": [
    { name: "Av. Maipú", city: "Olivos", province: "Buenos Aires", zipCode: "1636" },
    { name: "Av. del Libertador", city: "Olivos", province: "Buenos Aires", zipCode: "1636" },
  ],
  "San Fernando": [
    { name: "Av. Avellaneda", city: "San Fernando", province: "Buenos Aires", zipCode: "1646" },
    { name: "Av. Perón", city: "San Fernando", province: "Buenos Aires", zipCode: "1646" },
  ],
  "Tigre": [
    { name: "Av. Cazón", city: "Tigre", province: "Buenos Aires", zipCode: "1648" },
    { name: "Av. Liniers", city: "Tigre", province: "Buenos Aires", zipCode: "1648" },
  ],

  // BUENOS AIRES - GBA ZONA SUR
  "Avellaneda": [
    { name: "Av. Mitre", city: "Avellaneda", province: "Buenos Aires", zipCode: "1870" },
    { name: "Av. Belgrano", city: "Avellaneda", province: "Buenos Aires", zipCode: "1870" },
  ],
  "Lanús": [
    { name: "Av. Hipólito Yrigoyen", city: "Lanús", province: "Buenos Aires", zipCode: "1824" },
    { name: "Av. 9 de Julio", city: "Lanús", province: "Buenos Aires", zipCode: "1824" },
  ],
  "Lomas de Zamora": [
    { name: "Av. Meeks", city: "Lomas de Zamora", province: "Buenos Aires", zipCode: "1832" },
    { name: "Av. Hipólito Yrigoyen", city: "Lomas de Zamora", province: "Buenos Aires", zipCode: "1832" },
  ],
  "Quilmes": [
    { name: "Av. Rivadavia", city: "Quilmes", province: "Buenos Aires", zipCode: "1878" },
    { name: "Av. Calchaquí", city: "Quilmes", province: "Buenos Aires", zipCode: "1878" },
  ],

  // BUENOS AIRES - GBA ZONA OESTE
  "La Matanza": [
    { name: "Av. Cristiania", city: "La Matanza", province: "Buenos Aires", zipCode: "1754" },
    { name: "Av. General Paz", city: "La Matanza", province: "Buenos Aires", zipCode: "1754" },
  ],
  "Morón": [
    { name: "Av. Rivadavia", city: "Morón", province: "Buenos Aires", zipCode: "1708" },
    { name: "Av. Gaona", city: "Morón", province: "Buenos Aires", zipCode: "1708" },
  ],
  "Tres de Febrero": [
    { name: "Av. Márquez", city: "Tres de Febrero", province: "Buenos Aires", zipCode: "1678" },
    { name: "Av. San Martín", city: "Tres de Febrero", province: "Buenos Aires", zipCode: "1678" },
  ],

  // CÓRDOBA
  "Córdoba": [
    { name: "Av. Colón", city: "Córdoba", province: "Córdoba", zipCode: "5000" },
    { name: "Av. Vélez Sarsfield", city: "Córdoba", province: "Córdoba", zipCode: "5000" },
    { name: "Av. Hipólito Yrigoyen", city: "Córdoba", province: "Córdoba", zipCode: "5000" },
    { name: "Av. Rafael Núñez", city: "Córdoba", province: "Córdoba", zipCode: "5000" },
  ],

  // ROSARIO
  "Rosario": [
    { name: "Av. Pellegrini", city: "Rosario", province: "Santa Fe", zipCode: "2000" },
    { name: "Av. Córdoba", city: "Rosario", province: "Santa Fe", zipCode: "2000" },
    { name: "Bv. Oroño", city: "Rosario", province: "Santa Fe", zipCode: "2000" },
    { name: "San Martín", city: "Rosario", province: "Santa Fe", zipCode: "2000" },
  ],

  // MENDOZA
  "Mendoza": [
    { name: "Av. San Martín", city: "Mendoza", province: "Mendoza", zipCode: "5500" },
    { name: "Av. Las Heras", city: "Mendoza", province: "Mendoza", zipCode: "5500" },
    { name: "Av. Emilio Civit", city: "Mendoza", province: "Mendoza", zipCode: "5500" },
  ],

  // LA PLATA
  "La Plata": [
    { name: "Av. 7", city: "La Plata", province: "Buenos Aires", zipCode: "1900" },
    { name: "Av. 13", city: "La Plata", province: "Buenos Aires", zipCode: "1900" },
    { name: "Av. 1", city: "La Plata", province: "Buenos Aires", zipCode: "1900" },
    { name: "Diagonal 74", city: "La Plata", province: "Buenos Aires", zipCode: "1900" },
  ],
};

export function searchStreets(query: string, city: string): Street[] {
  const cityStreets = popularStreets[city] || [];
  
  if (!query || query.length < 2) {
    return cityStreets.slice(0, 8); // Mostrar las primeras 8
  }
  
  const normalizedQuery = query.toLowerCase();
  return cityStreets.filter(street => 
    street.name.toLowerCase().includes(normalizedQuery)
  );
}

export function getAllStreetsForCity(city: string): Street[] {
  return popularStreets[city] || [];
}
