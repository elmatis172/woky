-- Agregar métodos de envío locales
INSERT INTO "ShippingMethod" (id, name, description, type, cost, "estimatedDays", "isActive", provinces, "minAmount", "maxAmount", "createdAt", "updatedAt")
VALUES 
  -- Envío local CABA y GBA
  ('local-caba-gba', 'Envío Local CABA/GBA', 'Envío en el día para CABA y Gran Buenos Aires', 'LOCAL', 50000, '24 horas', true, '["Buenos Aires", "Ciudad Autónoma de Buenos Aires"]', NULL, NULL, NOW(), NOW()),
  
  -- Envío a todo el país
  ('standard-nacional', 'Envío a Domicilio', 'Envío estándar a todo el país', 'STANDARD', 150000, '3-5 días hábiles', true, NULL, NULL, NULL, NOW(), NOW()),
  
  -- Retiro en sucursal
  ('pickup-store', 'Retiro en Sucursal', 'Retirá tu pedido en nuestra sucursal', 'PICKUP', 0, 'Inmediato', true, NULL, NULL, NULL, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  cost = EXCLUDED.cost,
  "estimatedDays" = EXCLUDED."estimatedDays",
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = NOW();
