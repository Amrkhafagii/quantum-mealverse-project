
-- First backup existing location data if any exists
CREATE TABLE temp_restaurant_locations AS
SELECT id, 
       ST_X(location::geometry) as longitude,
       ST_Y(location::geometry) as latitude
FROM restaurants
WHERE location IS NOT NULL;

-- Drop the location column and add separate lat/long columns
ALTER TABLE restaurants 
DROP COLUMN location;

ALTER TABLE restaurants
ADD COLUMN latitude numeric NOT NULL,
ADD COLUMN longitude numeric NOT NULL;

-- Restore the location data
UPDATE restaurants r
SET 
    latitude = t.latitude,
    longitude = t.longitude
FROM temp_restaurant_locations t
WHERE r.id = t.id;

-- Drop temporary table
DROP TABLE temp_restaurant_locations;

-- Create spatial index on the coordinates
CREATE INDEX idx_restaurants_coordinates 
ON restaurants USING gist (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);
