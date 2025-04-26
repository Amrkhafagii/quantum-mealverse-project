
-- Add missing columns to menu_items
ALTER TABLE IF EXISTS menu_items 
ADD COLUMN IF NOT EXISTS ingredients TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS steps TEXT[] DEFAULT '{}';

-- Set default values for existing rows that don't have these columns
UPDATE menu_items 
SET 
  ingredients = '{}',
  steps = '{}'
WHERE ingredients IS NULL OR steps IS NULL;
