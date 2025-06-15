
-- Update find_nearest_restaurant function to return multiple restaurants with correct data
DROP FUNCTION IF EXISTS public.find_nearest_restaurant(double precision, double precision, double precision);

CREATE OR REPLACE FUNCTION public.find_nearest_restaurant(
  order_lat double precision,
  order_lng double precision,
  max_distance_km double precision DEFAULT 50
)
RETURNS TABLE (
  restaurant_id uuid,
  restaurant_name text,
  restaurant_address text,
  restaurant_email text,
  restaurant_latitude double precision,
  restaurant_longitude double precision,
  distance_km double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id as restaurant_id,
    r.name as restaurant_name,
    r.address as restaurant_address,
    r.email as restaurant_email,
    r.latitude as restaurant_latitude,
    r.longitude as restaurant_longitude,
    ST_Distance(
      ST_SetSRID(ST_MakePoint(r.longitude, r.latitude), 4326)::geography,
      ST_SetSRID(ST_MakePoint(order_lng, order_lat), 4326)::geography
    ) / 1000 as distance_km
  FROM restaurants r
  WHERE r.is_active = true
    AND r.latitude IS NOT NULL
    AND r.longitude IS NOT NULL
  AND ST_DWithin(
    ST_SetSRID(ST_MakePoint(r.longitude, r.latitude), 4326)::geography,
    ST_SetSRID(ST_MakePoint(order_lng, order_lat), 4326)::geography,
    max_distance_km * 1000  -- Convert km to meters
  )
  ORDER BY distance_km ASC;
END;
$$ LANGUAGE plpgsql;
