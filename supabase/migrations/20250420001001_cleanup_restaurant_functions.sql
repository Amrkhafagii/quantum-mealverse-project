

-- Drop the overloaded version of find_nearest_restaurant with 4 parameters
DROP FUNCTION IF EXISTS public.find_nearest_restaurant(double precision, double precision, double precision, integer);

-- Keep only the 3-parameter version from the original migration file
CREATE OR REPLACE FUNCTION find_nearest_restaurant(
    order_lat double precision,
    order_lng double precision,
    max_distance_km double precision DEFAULT 50
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
            ST_SetSRID(ST_MakePoint(r.longitude, r.latitude), 4326)::geography,
            ST_SetSRID(ST_MakePoint(order_lng, order_lat), 4326)::geography
        ) / 1000 as distance_km
    FROM restaurants r
    WHERE r.is_active = true
    AND ST_DWithin(
        ST_SetSRID(ST_MakePoint(r.longitude, r.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint(order_lng, order_lat), 4326)::geography,
        max_distance_km * 1000  -- Convert km to meters
    )
    ORDER BY distance_km ASC
    LIMIT 1;
END;
$$;

