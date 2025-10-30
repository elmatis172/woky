-- Agregar campos de dimensiones a la tabla Product si no existen
-- Esta migración es segura y puede ejecutarse múltiples veces

DO $$ 
BEGIN
    -- Agregar weight (peso en gramos)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='Product' AND column_name='weight') THEN
        ALTER TABLE "Product" ADD COLUMN "weight" INTEGER;
    END IF;

    -- Agregar width (ancho en cm)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='Product' AND column_name='width') THEN
        ALTER TABLE "Product" ADD COLUMN "width" INTEGER;
    END IF;

    -- Agregar height (alto en cm)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='Product' AND column_name='height') THEN
        ALTER TABLE "Product" ADD COLUMN "height" INTEGER;
    END IF;

    -- Agregar length (largo en cm)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='Product' AND column_name='length') THEN
        ALTER TABLE "Product" ADD COLUMN "length" INTEGER;
    END IF;
END $$;

-- Verificar que se agregaron correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Product' 
  AND column_name IN ('weight', 'width', 'height', 'length')
ORDER BY column_name;
