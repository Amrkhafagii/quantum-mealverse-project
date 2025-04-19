
-- Function to find nearest restaurants with distance limit
-- Make sure this function name matches exactly what we call in the code
CREATE OR REPLACE FUNCTION find_nearest_restaurant(
  order_lat double precision,
  order_lng double precision,
  max_distance_km double precision DEFAULT 50,
  limit_count integer DEFAULT 3
)
RETURNS TABLE (
  restaurant_id uuid, 
  user_id uuid,
  distance_km double precision
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id as restaurant_id,
        r.user_id,
        ST_Distance(
            r.location::geography,
            ST_SetSRID(ST_MakePoint(order_lng, order_lat), 4326)::geography
        ) / 1000 as distance_km
    FROM restaurants r
    WHERE r.is_active = true
    AND ST_DWithin(
        r.location::geography,
        ST_SetSRID(ST_MakePoint(order_lng, order_lat), 4326)::geography,
        max_distance_km * 1000  -- Convert km to meters
    )
    ORDER BY distance_km ASC
    LIMIT limit_count;
END;
$$;
