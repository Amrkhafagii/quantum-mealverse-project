
-- Drop the unused server_time function since we're now using an edge function
DROP FUNCTION IF EXISTS get_server_time();

