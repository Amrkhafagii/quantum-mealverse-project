
-- Create nutrition_cart_items table for meal planning
CREATE TABLE nutrition_cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text, -- For anonymous users
  name text NOT NULL,
  calories numeric NOT NULL DEFAULT 0,
  protein numeric NOT NULL DEFAULT 0,
  carbs numeric NOT NULL DEFAULT 0,
  fat numeric NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  portion_size numeric NOT NULL DEFAULT 100, -- in grams
  food_category text,
  meal_type text NOT NULL, -- breakfast, lunch, dinner, snack
  usda_food_id text, -- Reference to USDA database if applicable
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_nutrition_cart_user_id ON nutrition_cart_items(user_id);
CREATE INDEX idx_nutrition_cart_session_id ON nutrition_cart_items(session_id);
CREATE INDEX idx_nutrition_cart_meal_type ON nutrition_cart_items(meal_type);

-- Enable RLS
ALTER TABLE nutrition_cart_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for nutrition cart items
CREATE POLICY "Users can view their own nutrition cart items" ON nutrition_cart_items
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

CREATE POLICY "Users can insert their own nutrition cart items" ON nutrition_cart_items
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

CREATE POLICY "Users can update their own nutrition cart items" ON nutrition_cart_items
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

CREATE POLICY "Users can delete their own nutrition cart items" ON nutrition_cart_items
  FOR DELETE USING (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND session_id IS NOT NULL)
  );

-- Create meal_plan_to_menu_mappings table for conversion
CREATE TABLE meal_plan_to_menu_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nutrition_food_name text NOT NULL,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  similarity_score numeric DEFAULT 0, -- 0-1 score for how well they match
  nutritional_accuracy numeric DEFAULT 0, -- 0-1 score for nutritional match
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for mappings
CREATE INDEX idx_mappings_nutrition_food ON meal_plan_to_menu_mappings(nutrition_food_name);
CREATE INDEX idx_mappings_menu_item ON meal_plan_to_menu_mappings(menu_item_id);

-- Enable RLS for mappings (read-only for users)
ALTER TABLE meal_plan_to_menu_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view meal plan mappings" ON meal_plan_to_menu_mappings
  FOR SELECT USING (true);
