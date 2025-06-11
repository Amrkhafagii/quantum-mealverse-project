
-- Fix ambiguous user_id references in trigger functions

-- Update notify_order_status_change function to use customer_id
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    order_formatted_id TEXT;
    order_customer_id UUID;
    notification_title TEXT;
    notification_message TEXT;
    notification_link TEXT;
BEGIN
    -- Get the order's formatted ID and customer ID
    SELECT o.formatted_order_id, o.customer_id INTO order_formatted_id, order_customer_id
    FROM public.orders o
    WHERE o.id = NEW.id;
    
    -- Set notification content based on new status
    CASE NEW.status
        WHEN 'pending' THEN
            notification_title := 'Order Received';
            notification_message := 'Your order ' || order_formatted_id || ' has been received and is pending processing.';
        WHEN 'processing' THEN
            notification_title := 'Order Processing';
            notification_message := 'Your order ' || order_formatted_id || ' is now being processed.';
        WHEN 'restaurant_accepted' THEN
            notification_title := 'Order Accepted';
            notification_message := 'Your order ' || order_formatted_id || ' has been accepted by the restaurant.';
        WHEN 'preparing' THEN
            notification_title := 'Order Being Prepared';
            notification_message := 'Your order ' || order_formatted_id || ' is being prepared.';
        WHEN 'ready_for_pickup' THEN
            notification_title := 'Order Ready';
            notification_message := 'Your order ' || order_formatted_id || ' is ready for pickup.';
        WHEN 'on_the_way' THEN
            notification_title := 'Order On The Way';
            notification_message := 'Your order ' || order_formatted_id || ' is on the way to you!';
        WHEN 'delivered' THEN
            notification_title := 'Order Delivered';
            notification_message := 'Your order ' || order_formatted_id || ' has been delivered. Enjoy!';
        WHEN 'cancelled' THEN
            notification_title := 'Order Cancelled';
            notification_message := 'Your order ' || order_formatted_id || ' has been cancelled.';
        ELSE
            notification_title := 'Order Update';
            notification_message := 'Your order ' || order_formatted_id || ' status has changed to ' || NEW.status || '.';
    END CASE;
    
    notification_link := '/orders/' || NEW.id;
    
    -- Create notification only if customer_id exists
    IF order_customer_id IS NOT NULL THEN
        INSERT INTO public.notifications
            (user_id, title, message, link, type)
        VALUES
            (order_customer_id, notification_title, notification_message, notification_link, 'order_status');
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Update create_earnings_on_order_completion function to use customer_id
CREATE OR REPLACE FUNCTION public.create_earnings_on_order_completion()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    delivery_assignment_record RECORD;
    restaurant_share NUMERIC;
    delivery_share NUMERIC;
    platform_share NUMERIC;
BEGIN
    -- Only process when order status changes to 'delivered'
    IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
        
        -- Calculate earnings distribution (example percentages)
        restaurant_share := NEW.total * 0.70; -- 70% to restaurant
        delivery_share := NEW.total * 0.20;   -- 20% to delivery driver
        platform_share := NEW.total * 0.10;   -- 10% to platform
        
        -- Get delivery assignment info
        SELECT da.delivery_user_id INTO delivery_assignment_record
        FROM delivery_assignments da
        WHERE da.order_id = NEW.id
        AND da.status = 'delivered'
        LIMIT 1;
        
        -- Create restaurant earnings
        IF NEW.restaurant_id IS NOT NULL THEN
            INSERT INTO earnings (
                user_id,
                order_id,
                amount,
                type,
                status
            ) VALUES (
                (SELECT r.user_id FROM restaurants r WHERE r.id = NEW.restaurant_id),
                NEW.id,
                restaurant_share,
                'restaurant_order',
                'completed'
            );
        END IF;
        
        -- Create delivery earnings
        IF delivery_assignment_record.delivery_user_id IS NOT NULL THEN
            INSERT INTO earnings (
                user_id,
                order_id,
                amount,
                type,
                status
            ) VALUES (
                delivery_assignment_record.delivery_user_id,
                NEW.id,
                delivery_share,
                'delivery_fee',
                'completed'
            );
        END IF;
        
        -- Create platform earnings
        INSERT INTO earnings (
            user_id,
            order_id,
            amount,
            type,
            status
        ) VALUES (
            NULL, -- Platform earnings don't belong to a specific user
            NEW.id,
            platform_share,
            'platform_fee',
            'completed'
        );
        
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Update track_order_status_change function to use customer_id
CREATE OR REPLACE FUNCTION public.track_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Insert into order_status_history table for tracking
    INSERT INTO order_status_history (
        order_id,
        new_status,
        previous_status,
        changed_at,
        customer_id
    ) VALUES (
        NEW.id,
        NEW.status,
        OLD.status,
        NOW(),
        NEW.customer_id
    );
    
    RETURN NEW;
END;
$function$;

-- Update any other functions that might have ambiguous references
-- Fix the create_order_status_notification function to use customer_id properly
CREATE OR REPLACE FUNCTION public.create_order_status_notification()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  order_formatted_id TEXT;
  order_customer_id UUID;
  notification_title TEXT;
  notification_message TEXT;
  notification_link TEXT;
BEGIN
  -- Get the order's formatted ID and customer ID using proper table alias
  SELECT o.formatted_order_id, o.customer_id INTO order_formatted_id, order_customer_id
  FROM public.orders o
  WHERE o.id = NEW.order_id;
  
  -- Set notification content based on new status
  CASE NEW.new_status
    WHEN 'pending' THEN
      notification_title := 'Order Received';
      notification_message := 'Your order ' || order_formatted_id || ' has been received and is pending processing.';
    WHEN 'processing' THEN
      notification_title := 'Order Processing';
      notification_message := 'Your order ' || order_formatted_id || ' is now being processed.';
    WHEN 'on_the_way' THEN
      notification_title := 'Order On The Way';
      notification_message := 'Your order ' || order_formatted_id || ' is on the way to you!';
    WHEN 'delivered' THEN
      notification_title := 'Order Delivered';
      notification_message := 'Your order ' || order_formatted_id || ' has been delivered. Enjoy!';
    WHEN 'cancelled' THEN
      notification_title := 'Order Cancelled';
      notification_message := 'Your order ' || order_formatted_id || ' has been cancelled.';
    ELSE
      notification_title := 'Order Update';
      notification_message := 'Your order ' || order_formatted_id || ' status has changed to ' || NEW.new_status || '.';
  END CASE;
  
  notification_link := '/orders/' || NEW.order_id;
  
  -- Create notification only if customer_id exists
  IF order_customer_id IS NOT NULL THEN
    INSERT INTO public.notifications
      (user_id, title, message, link, type)
    VALUES
      (order_customer_id, notification_title, notification_message, notification_link, 'order_status');
  END IF;
  
  RETURN NEW;
END;
$function$;

