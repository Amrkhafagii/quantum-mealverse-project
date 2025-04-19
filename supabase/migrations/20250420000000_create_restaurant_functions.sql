
-- Function to find nearest restaurants with distance limit
CREATE OR REPLACE FUNCTION find_nearest_restaurants(
  lat double precision,
  lng double precision,
  max_distance double precision DEFAULT 50,
  result_limit integer DEFAULT 3
)
RETURNS TABLE (
  restaurant_id uuid, 
  user_id uuid,
  name text,
  distance_km double precision
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id as restaurant_id, 
    user_id,
    name,
    ST_Distance(
      location::geography,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) / 1000 as distance_km
  FROM 
    restaurants
  WHERE 
    is_active = true
    AND ST_DWithin(
      location::geography,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
      max_distance * 1000
    )
  ORDER BY 
    distance_km
  LIMIT result_limit;
END;
$$;

-- Function to find all restaurants sorted by distance (without distance limit)
CREATE OR REPLACE FUNCTION find_all_restaurants_by_distance(
  lat double precision,
  lng double precision,
  result_limit integer DEFAULT 5
)
RETURNS TABLE (
  restaurant_id uuid, 
  user_id uuid,
  name text,
  distance_km double precision
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id as restaurant_id, 
    user_id,
    name,
    ST_Distance(
      location::geography,
      ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
    ) / 1000 as distance_km
  FROM 
    restaurants
  WHERE 
    is_active = true
  ORDER BY 
    distance_km
  LIMIT result_limit;
END;
$$;
