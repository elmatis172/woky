-- Emergency fix: Drop shippingStatus column if it exists
ALTER TABLE "Order" DROP COLUMN IF EXISTS "shippingStatus";

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Order'
ORDER BY ordinal_position;
