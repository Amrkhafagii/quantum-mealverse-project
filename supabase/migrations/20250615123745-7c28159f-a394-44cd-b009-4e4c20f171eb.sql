
-- Enable the PostGIS extension if it's not already enabled.
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create a Postgres function to calculate Haversine distance (in km) between two latitude/longitude pairs.
CREATE OR REPLACE FUNCTION public.calculate_delivery_distance(
  lat1 double precision,
  lng1 double precision,
  lat2 double precision,
  lng2 double precision
) RETURNS double precision
LANGUAGE sql
IMMUTABLE
AS $function$
  SELECT ST_DistanceSphere( -- returns meters between two points
    ST_MakePoint(lng1, lat1),
    ST_MakePoint(lng2, lat2)
  ) / 1000.0 -- km
$function$;
