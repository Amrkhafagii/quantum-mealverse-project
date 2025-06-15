
-- Fix RLS policies for order status updates

-- Drop the existing restrictive customer update policy
DROP POLICY IF EXISTS "Customers can update their own orders" ON orders;

-- Create more granular update policies for customers
-- Allow customers to update their own orders for basic fields
CREATE POLICY "Customers can update basic order fields" ON orders
  FOR UPDATE USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- Allow customers to cancel their own orders
CREATE POLICY "Customers can cancel their own orders" ON orders
  FOR UPDATE USING (
    customer_id = auth.uid() 
    AND status IN ('pending', 'awaiting_restaurant', 'confirmed')
  )
  WITH CHECK (
    customer_id = auth.uid() 
    AND status = 'cancelled'
  );

-- Allow system status updates for customer orders (like no_restaurant_available)
CREATE POLICY "Allow system status updates on customer orders" ON orders
  FOR UPDATE USING (customer_id = auth.uid())
  WITH CHECK (
    customer_id = auth.uid() 
    AND status IN (
      'no_restaurant_available', 
      'no_restaurant_accepted',
      'awaiting_restaurant',
      'restaurant_accepted',
      'confirmed',
      'preparing',
      'ready',
      'in_transit',
      'delivered',
      'completed',
      'cancelled'
    )
  );

-- Ensure the helper function exists for admin checks
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
