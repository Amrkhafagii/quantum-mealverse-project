
-- Fix order_items unique constraint migration
-- This migration ensures the constraint is properly created

-- First, remove any duplicate order items that might prevent constraint creation
DELETE FROM public.order_items 
WHERE id NOT IN (
    SELECT MIN(id) 
    FROM public.order_items 
    GROUP BY order_id, meal_id
);

-- Drop the constraint if it exists (with proper error handling)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'order_items_order_meal_unique' 
        AND table_name = 'order_items'
    ) THEN
        ALTER TABLE public.order_items DROP CONSTRAINT order_items_order_meal_unique;
    END IF;
END $$;

-- Add the unique constraint
ALTER TABLE public.order_items 
ADD CONSTRAINT order_items_order_meal_unique 
UNIQUE (order_id, meal_id);

-- Create supporting index for performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_meal 
ON public.order_items (order_id, meal_id);

-- Add comment for documentation
COMMENT ON CONSTRAINT order_items_order_meal_unique ON public.order_items 
IS 'Ensures unique meal items per order to prevent duplicates';
