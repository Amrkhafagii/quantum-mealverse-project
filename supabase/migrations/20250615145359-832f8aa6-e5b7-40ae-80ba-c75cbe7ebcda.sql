
-- Fix order_items source_type check constraint to include 'nutrition_generation'
-- This resolves the constraint violation when creating orders with nutrition-generated items

-- Drop the existing constraint
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_source_type_check;

-- Add the updated constraint that includes 'nutrition_generation'
ALTER TABLE order_items ADD CONSTRAINT order_items_source_type_check 
CHECK (source_type = ANY (ARRAY['meal_plan'::text, 'menu_item'::text, 'custom'::text, 'nutrition_generation'::text]));

-- Add comment for documentation
COMMENT ON CONSTRAINT order_items_source_type_check ON order_items 
IS 'Ensures source_type is one of: meal_plan, menu_item, custom, nutrition_generation';
