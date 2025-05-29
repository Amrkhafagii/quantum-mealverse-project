
-- Create RPC functions for delivery count management
CREATE OR REPLACE FUNCTION increment_delivery_count(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE delivery_driver_availability
  SET current_delivery_count = current_delivery_count + 1
  WHERE delivery_user_id = user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_delivery_count(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE delivery_driver_availability
  SET current_delivery_count = GREATEST(0, current_delivery_count - 1)
  WHERE delivery_user_id = user_id;
END;
$$ LANGUAGE plpgsql;
