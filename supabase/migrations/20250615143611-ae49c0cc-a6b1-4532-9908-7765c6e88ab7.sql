
-- First, let's check existing RLS policies on the orders table and fix any that reference admin_users.user_id

-- Drop existing problematic policies if they exist
DROP POLICY IF EXISTS "Admin users can manage all orders" ON orders;
DROP POLICY IF EXISTS "Admin access to orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admin users can do everything on orders" ON orders;

-- Create a helper function to check if user is admin with correct column reference
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM admin_users 
    WHERE admin_users_user_id = user_id
  );
$$;

-- Create correct RLS policies for orders table
CREATE POLICY "Customers can view their own orders" ON orders
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Customers can insert their own orders" ON orders
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can update their own orders" ON orders
  FOR UPDATE USING (customer_id = auth.uid());

CREATE POLICY "Admin users can manage all orders" ON orders
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Restaurant owners can view orders assigned to their restaurants" ON orders
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM restaurants 
      WHERE restaurants_user_id = auth.uid()
    )
  );

CREATE POLICY "Restaurant owners can update orders assigned to their restaurants" ON orders
  FOR UPDATE USING (
    restaurant_id IN (
      SELECT id FROM restaurants 
      WHERE restaurants_user_id = auth.uid()
    )
  );

CREATE POLICY "Delivery users can view assigned orders" ON orders
  FOR SELECT USING (
    id IN (
      SELECT order_id FROM delivery_assignments 
      WHERE delivery_user_id = auth.uid()
    )
  );

CREATE POLICY "Delivery users can update assigned orders" ON orders
  FOR UPDATE USING (
    id IN (
      SELECT order_id FROM delivery_assignments 
      WHERE delivery_user_id = auth.uid()
    )
  );

-- Ensure RLS is enabled on the orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
