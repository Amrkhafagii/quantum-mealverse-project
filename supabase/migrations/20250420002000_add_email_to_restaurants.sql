
-- Add email column to restaurants table
ALTER TABLE restaurants 
ADD COLUMN email TEXT NULL;

-- Update function to include email in result
CREATE OR REPLACE FUNCTION find_nearest_restaurant(
  order_lat NUMERIC,
  order_lng NUMERIC,
  max_distance_km NUMERIC DEFAULT 50
)
RETURNS TABLE (
  restaurant_id UUID,
  restaurant_name TEXT,
  restaurant_address TEXT,
  restaurant_email TEXT,
  distance_km FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id as restaurant_id,
    r.name as restaurant_name,
    r.address as restaurant_address,
    r.email as restaurant_email,
    (
      6371 * acos(
        cos(radians(order_lat)) * 
        cos(radians(r.latitude)) * 
        cos(radians(r.longitude) - radians(order_lng)) + 
        sin(radians(order_lat)) * 
        sin(radians(r.latitude))
      )
    ) AS distance_km
  FROM restaurants r
  WHERE r.is_active = true
    AND r.latitude IS NOT NULL
    AND r.longitude IS NOT NULL
  HAVING 
    (6371 * acos(
      cos(radians(order_lat)) * 
      cos(radians(r.latitude)) * 
      cos(radians(r.longitude) - radians(order_lng)) + 
      sin(radians(order_lat)) * 
      sin(radians(r.latitude))
    )) <= max_distance_km
  ORDER BY distance_km
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;
