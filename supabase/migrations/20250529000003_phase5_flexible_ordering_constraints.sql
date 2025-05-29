
-- Phase 5: Database Schema Updates for Flexible Ordering
-- Remove restrictive foreign key constraints to allow flexible meal ordering

-- First, let's check and remove any restrictive foreign key constraints on order_items
-- that prevent flexible meal_id assignment

-- Drop foreign key constraint on meal_id if it exists (allows any meal_id values)
DO $$ 
BEGIN
    -- Check if there's a foreign key constraint on meal_id in order_items
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'order_items' 
        AND kcu.column_name = 'meal_id'
        AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN
        -- Get the constraint name and drop it
        DECLARE
            constraint_name TEXT;
        BEGIN
            SELECT tc.constraint_name INTO constraint_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'order_items' 
            AND kcu.column_name = 'meal_id'
            AND tc.constraint_type = 'FOREIGN KEY'
            LIMIT 1;
            
            IF constraint_name IS NOT NULL THEN
                EXECUTE 'ALTER TABLE public.order_items DROP CONSTRAINT ' || constraint_name;
                RAISE NOTICE 'Dropped foreign key constraint % on meal_id', constraint_name;
            END IF;
        END;
    END IF;
END $$;

-- Ensure order_items table structure supports flexible ordering
-- Add any missing columns that might be needed for flexible meal assignment

-- Add menu_item_id column if it doesn't exist (for traditional restaurant orders)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_items' AND column_name = 'menu_item_id'
    ) THEN
        ALTER TABLE public.order_items ADD COLUMN menu_item_id UUID;
        COMMENT ON COLUMN public.order_items.menu_item_id IS 'Optional reference to restaurant menu items for traditional orders';
    END IF;
END $$;

-- Make meal_id column more flexible by allowing NULLs for traditional orders
DO $$ 
BEGIN
    -- Check if meal_id is currently NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'meal_id' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE public.order_items ALTER COLUMN meal_id DROP NOT NULL;
        COMMENT ON COLUMN public.order_items.meal_id IS 'Reference to meal plans or custom meals - nullable for traditional restaurant orders';
    END IF;
END $$;

-- Add source_type column to track order item origin
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_items' AND column_name = 'source_type'
    ) THEN
        ALTER TABLE public.order_items ADD COLUMN source_type TEXT DEFAULT 'meal_plan'
        CHECK (source_type IN ('meal_plan', 'menu_item', 'custom'));
        COMMENT ON COLUMN public.order_items.source_type IS 'Indicates whether item comes from meal plan, restaurant menu, or custom creation';
    END IF;
END $$;

-- Ensure restaurant_assignments table supports flexible assignment
-- Remove any overly restrictive constraints on restaurant assignment

-- Check if there are any constraints preventing flexible restaurant assignment
DO $$ 
BEGIN
    -- Remove unique constraints that might prevent multiple assignments for the same order
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'restaurant_assignments' 
        AND constraint_name LIKE '%order_id%unique%'
        AND constraint_type = 'UNIQUE'
    ) THEN
        DECLARE
            constraint_name TEXT;
        BEGIN
            SELECT tc.constraint_name INTO constraint_name
            FROM information_schema.table_constraints tc
            WHERE tc.table_name = 'restaurant_assignments' 
            AND tc.constraint_name LIKE '%order_id%unique%'
            AND tc.constraint_type = 'UNIQUE'
            LIMIT 1;
            
            IF constraint_name IS NOT NULL THEN
                EXECUTE 'ALTER TABLE public.restaurant_assignments DROP CONSTRAINT ' || constraint_name;
                RAISE NOTICE 'Dropped overly restrictive unique constraint % on restaurant_assignments', constraint_name;
            END IF;
        END;
    END IF;
END $$;

-- Create indexes for better performance with flexible queries
CREATE INDEX IF NOT EXISTS idx_order_items_source_type ON public.order_items (source_type);
CREATE INDEX IF NOT EXISTS idx_order_items_meal_id_nullable ON public.order_items (meal_id) WHERE meal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON public.order_items (menu_item_id) WHERE menu_item_id IS NOT NULL;

-- Update the unique constraint on order_items to be more flexible
-- Allow multiple items with the same meal_id or menu_item_id per order
DO $$ 
BEGIN
    -- Check if the existing unique constraint is too restrictive
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'order_items' 
        AND constraint_name = 'order_items_order_meal_unique'
    ) THEN
        -- Drop the existing constraint
        ALTER TABLE public.order_items DROP CONSTRAINT order_items_order_meal_unique;
        
        -- Create a more flexible constraint that allows nulls and duplicates when needed
        -- This constraint only applies when meal_id is not null
        CREATE UNIQUE INDEX order_items_order_meal_flexible 
        ON public.order_items (order_id, meal_id) 
        WHERE meal_id IS NOT NULL AND source_type = 'meal_plan';
        
        COMMENT ON INDEX order_items_order_meal_flexible IS 'Flexible constraint allowing duplicate meal_ids for different source types';
    END IF;
END $$;

-- Ensure orders table supports flexible assignment sources
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'assignment_source'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN assignment_source TEXT DEFAULT 'automatic'
        CHECK (assignment_source IN ('automatic', 'manual', 'nutrition_generation', 'traditional_ordering'));
        COMMENT ON COLUMN public.orders.assignment_source IS 'Tracks how the restaurant assignment was made';
    END IF;
END $$;

-- Add support for mixed order types (meal plans + traditional items)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'is_mixed_order'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN is_mixed_order BOOLEAN DEFAULT FALSE;
        COMMENT ON COLUMN public.orders.is_mixed_order IS 'True if order contains both meal plan items and traditional restaurant items';
    END IF;
END $$;

-- Create a view for easier querying of flexible order items
CREATE OR REPLACE VIEW flexible_order_items AS
SELECT 
    oi.*,
    CASE 
        WHEN oi.source_type = 'meal_plan' THEN 'Meal Plan: ' || oi.name
        WHEN oi.source_type = 'menu_item' THEN 'Menu Item: ' || oi.name  
        ELSE 'Custom: ' || oi.name
    END as display_name,
    CASE 
        WHEN oi.meal_id IS NOT NULL THEN 'meal_plan_based'
        WHEN oi.menu_item_id IS NOT NULL THEN 'menu_based'
        ELSE 'custom_item'
    END as item_category
FROM order_items oi;

COMMENT ON VIEW flexible_order_items IS 'Enhanced view of order items supporting flexible meal and menu item assignment';

-- Log the migration completion
INSERT INTO public.data_retention_logs (success, results, executed_at)
VALUES (
    true, 
    '{"migration": "phase5_flexible_ordering_constraints", "description": "Removed restrictive foreign key constraints and added flexible ordering support"}'::jsonb,
    now()
);
