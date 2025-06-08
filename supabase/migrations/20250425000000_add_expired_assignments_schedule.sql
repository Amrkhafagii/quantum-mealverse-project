
-- Create a function to check for expired assignments with proper table aliases
CREATE OR REPLACE FUNCTION check_expired_assignments()
RETURNS void AS $$
DECLARE
  now_timestamp TIMESTAMP WITH TIME ZONE := NOW();
  assignment RECORD;
  order_id UUID;
  no_pending BOOLEAN;
  no_accepted BOOLEAN;
BEGIN
  -- Log execution
  RAISE NOTICE 'Running check_expired_assignments at %', now_timestamp;
  
  -- Find all pending assignments that have expired (5 minutes timeout)
  FOR assignment IN 
    SELECT ra.id, ra.order_id, ra.restaurant_id, ra.created_at
    FROM restaurant_assignments ra
    WHERE ra.status = 'pending' 
    AND ra.created_at < (now_timestamp - INTERVAL '5 minutes')
  LOOP
    -- Update the assignment status to expired
    UPDATE restaurant_assignments
    SET status = 'expired', updated_at = now_timestamp
    WHERE id = assignment.id;
    
    -- Log in order_history using proper column names
    INSERT INTO order_history (
      order_id, 
      status, 
      restaurant_id,
      restaurant_name,
      details
    ) VALUES (
      assignment.order_id, 
      'expired_assignment',
      assignment.restaurant_id,
      (SELECT r.name FROM restaurants r WHERE r.id = assignment.restaurant_id),
      jsonb_build_object(
        'assignment_id', assignment.id,
        'expired_at', now_timestamp,
        'auto_expired', true
      )
    );
    
    -- Check if this was the last pending assignment with proper aliases
    SELECT 
      (SELECT COUNT(*) = 0 FROM restaurant_assignments ra2 WHERE ra2.order_id = assignment.order_id AND ra2.status = 'pending') as no_pending,
      (SELECT COUNT(*) = 0 FROM restaurant_assignments ra3 WHERE ra3.order_id = assignment.order_id AND ra3.status = 'accepted') as no_accepted
    INTO
      no_pending, no_accepted;
    
    -- If no more pending or accepted assignments, update order status
    IF no_pending AND no_accepted THEN
      -- Update order status
      UPDATE orders
      SET status = 'no_restaurant_accepted'
      WHERE id = assignment.order_id;
      
      -- Log in order_history
      INSERT INTO order_history (
        order_id, 
        status,
        restaurant_id,
        restaurant_name,
        details
      ) VALUES (
        assignment.order_id, 
        'no_restaurant_accepted',
        NULL,
        NULL,
        jsonb_build_object('reason', 'All restaurant assignments expired')
      );
      
      RAISE NOTICE 'Updated order % to no_restaurant_accepted', assignment.order_id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to run the function every minute
SELECT cron.schedule(
  'check-expired-assignments',  -- name of the cron job
  '* * * * *',                  -- every minute
  'SELECT check_expired_assignments()'
);

-- Note: You'll need the pg_cron extension enabled in your database
-- If it's not already enabled, you can uncomment the line below:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
