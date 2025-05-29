
-- Add unique constraint for order_items to support ON CONFLICT operations
-- This ensures we can handle duplicate order items properly

-- First, let's check if the constraint already exists and drop it if it does
ALTER TABLE IF EXISTS public.order_items 
DROP CONSTRAINT IF EXISTS order_items_order_meal_unique;

-- Add unique constraint on order_id and meal_id combination
-- This prevents duplicate items for the same meal in the same order
ALTER TABLE public.order_items 
ADD CONSTRAINT order_items_order_meal_unique 
UNIQUE (order_id, meal_id);

-- Create index for better performance on this constraint
CREATE INDEX IF NOT EXISTS idx_order_items_order_meal 
ON public.order_items (order_id, meal_id);

-- Add comments for documentation
COMMENT ON CONSTRAINT order_items_order_meal_unique ON public.order_items 
IS 'Ensures unique meal items per order, allows ON CONFLICT operations';
