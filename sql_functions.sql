
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

-- Fixed function to check for expired assignments with proper table aliases
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
    
    -- Check if this was the last pending assignment
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

-- Updated generate_order_id function with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.generate_order_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    date_part TEXT;
    random_part TEXT;
    sequence_part TEXT;
    formatted_id TEXT;
    curr_date DATE := CURRENT_DATE;
    yr INTEGER := EXTRACT(YEAR FROM curr_date);
    mo INTEGER := EXTRACT(MONTH FROM curr_date);
    dy INTEGER := EXTRACT(DAY FROM curr_date);
    seq INTEGER;
BEGIN
    -- Generate date part (YYYYMMDD)
    date_part := TO_CHAR(curr_date, 'YYYYMMDD');
    
    -- Generate random part (4 uppercase letters)
    random_part := '';
    FOR i IN 1..2 LOOP
        random_part := random_part || CHR(65 + floor(random() * 26)::integer);
    END LOOP;
    
    -- Get or create sequence for today
    INSERT INTO public.order_sequences (year, month, day, sequence)
    VALUES (yr, mo, dy, 1)
    ON CONFLICT (year, month, day) 
    DO UPDATE SET sequence = order_sequences.sequence + 1
    RETURNING sequence INTO seq;
    
    -- Format sequence part (4-digit number)
    sequence_part := LPAD(seq::TEXT, 4, '0');
    
    -- Combine all parts
    formatted_id := 'ORD-' || date_part || '-' || random_part || '-' || sequence_part;
    
    -- Store the generated ID
    INSERT INTO public.order_id_formats (formatted_id, date_part, random_part, sequence_part)
    VALUES (formatted_id, date_part, random_part, sequence_part);
    
    RETURN formatted_id;
END;
$$;

-- Updated generate_ticket_number function with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  date_part TEXT;
  sequence_part INTEGER;
BEGIN
  date_part := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  -- Get next sequence for today
  INSERT INTO public.order_sequences (year, month, day, sequence)
  VALUES (
    EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
    EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, 
    EXTRACT(DAY FROM CURRENT_DATE)::INTEGER,
    1
  )
  ON CONFLICT (year, month, day) 
  DO UPDATE SET sequence = order_sequences.sequence + 1
  RETURNING sequence INTO sequence_part;
  
  RETURN 'TKT-' || date_part || '-' || LPAD(sequence_part::TEXT, 4, '0');
END;
$$;
