
-- Fix RLS policies for geofence_zones table
-- This will allow proper access based on ownership and user roles

-- First, ensure RLS is enabled (it should already be)
ALTER TABLE geofence_zones ENABLE ROW LEVEL SECURITY;

-- Policy 1: Customers can view zones related to their orders
CREATE POLICY "Customers can view their order zones" ON geofence_zones
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE customer_id = auth.uid()
    )
  );

-- Policy 2: Customers can create zones for their orders
CREATE POLICY "Customers can create zones for their orders" ON geofence_zones
  FOR INSERT WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE customer_id = auth.uid()
    )
  );

-- Policy 3: Restaurant owners can view zones for their orders
CREATE POLICY "Restaurant owners can view their zones" ON geofence_zones
  FOR SELECT USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE restaurants_user_id = auth.uid()
    ) OR
    order_id IN (
      SELECT id FROM orders WHERE restaurant_id IN (
        SELECT id FROM restaurants WHERE restaurants_user_id = auth.uid()
      )
    )
  );

-- Policy 4: Restaurant owners can create zones for their orders
CREATE POLICY "Restaurant owners can create zones" ON geofence_zones
  FOR INSERT WITH CHECK (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE restaurants_user_id = auth.uid()
    ) OR
    order_id IN (
      SELECT id FROM orders WHERE restaurant_id IN (
        SELECT id FROM restaurants WHERE restaurants_user_id = auth.uid()
      )
    )
  );

-- Policy 5: Delivery users can view zones for their assigned orders
CREATE POLICY "Delivery users can view assigned zones" ON geofence_zones
  FOR SELECT USING (
    order_id IN (
      SELECT order_id FROM delivery_assignments WHERE delivery_user_id = auth.uid()
    )
  );

-- Policy 6: Delivery users can create zones for their assigned orders
CREATE POLICY "Delivery users can create zones for assignments" ON geofence_zones
  FOR INSERT WITH CHECK (
    order_id IN (
      SELECT order_id FROM delivery_assignments WHERE delivery_user_id = auth.uid()
    )
  );

-- Policy 7: Admin users can manage all zones
CREATE POLICY "Admin users can manage all zones" ON geofence_zones
  FOR ALL USING (public.is_admin(auth.uid()));

-- Policy 8: System functions can create zones (using SECURITY DEFINER)
-- This allows automated zone creation during order processing
CREATE POLICY "System can create zones" ON geofence_zones
  FOR INSERT WITH CHECK (true);

-- Policy 9: Allow updates for zone owners
CREATE POLICY "Zone owners can update" ON geofence_zones
  FOR UPDATE USING (
    -- Customers can update zones for their orders
    order_id IN (
      SELECT id FROM orders WHERE customer_id = auth.uid()
    ) OR
    -- Restaurant owners can update their zones
    restaurant_id IN (
      SELECT id FROM restaurants WHERE restaurants_user_id = auth.uid()
    ) OR
    -- Delivery users can update zones for assigned orders
    order_id IN (
      SELECT order_id FROM delivery_assignments WHERE delivery_user_id = auth.uid()
    ) OR
    -- Admins can update all
    public.is_admin(auth.uid())
  );

-- Policy 10: Allow deletion for zone owners
CREATE POLICY "Zone owners can delete" ON geofence_zones
  FOR DELETE USING (
    -- Customers can delete zones for their orders
    order_id IN (
      SELECT id FROM orders WHERE customer_id = auth.uid()
    ) OR
    -- Restaurant owners can delete their zones
    restaurant_id IN (
      SELECT id FROM restaurants WHERE restaurants_user_id = auth.uid()
    ) OR
    -- Admins can delete all
    public.is_admin(auth.uid())
  );
