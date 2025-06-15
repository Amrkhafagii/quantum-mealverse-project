
-- 1. Drop existing restrictive SELECT policy if present
DROP POLICY IF EXISTS "Restaurant owners can view their own menu items" ON public.menu_items;

-- 2. Create a new, permissive SELECT policy for everyone
CREATE POLICY "Anyone can view available menu items"
  ON public.menu_items
  FOR SELECT
  USING (
    is_available = true
  );

-- 3. (Optional: Keep or tighten INSERT/UPDATE/DELETE policies)
-- You may keep your current modification policies as only owners can change menu items.
