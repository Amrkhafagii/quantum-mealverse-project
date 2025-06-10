
-- Drop and recreate the function with the correct return type
DROP FUNCTION IF EXISTS public.get_pending_restaurant_assignments(uuid);

-- Create a function to get pending restaurant assignments with proper aliases
CREATE OR REPLACE FUNCTION public.get_pending_restaurant_assignments(p_restaurant_id uuid)
RETURNS TABLE(
    assignment_id uuid,
    order_id uuid,
    expires_at timestamp with time zone,
    assigned_at timestamp with time zone,
    customer_id uuid,
    customer_name text,
    customer_email text,
    customer_phone text,
    delivery_address text,
    city text,
    delivery_method text,
    payment_method text,
    delivery_fee numeric,
    subtotal numeric,
    order_total numeric,
    order_created_at timestamp with time zone,
    order_updated_at timestamp with time zone,
    order_status text,
    latitude numeric,
    longitude numeric,
    formatted_order_id text,
    restaurant_id uuid,
    assignment_source text,
    notes text,
    order_items jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        ra.id as assignment_id,
        ra.order_id,
        ra.created_at + INTERVAL '5 minutes' as expires_at,
        ra.created_at as assigned_at,
        o.customer_id,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.delivery_address,
        o.city,
        o.delivery_method,
        o.payment_method,
        o.delivery_fee,
        o.subtotal,
        o.total as order_total,
        o.created_at as order_created_at,
        o.updated_at as order_updated_at,
        o.status as order_status,
        o.latitude,
        o.longitude,
        o.formatted_order_id,
        o.restaurant_id,
        o.assignment_source,
        o.notes,
        COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'id', oi.id,
                    'name', oi.name,
                    'quantity', oi.quantity,
                    'price', oi.price
                )
            )
            FROM order_items oi 
            WHERE oi.order_id = o.id), 
            '[]'::jsonb
        ) as order_items
    FROM restaurant_assignments ra
    JOIN orders o ON ra.order_id = o.id
    WHERE ra.restaurant_id = p_restaurant_id
    AND ra.status = 'pending'
    AND ra.created_at > NOW() - INTERVAL '5 minutes'
    ORDER BY ra.created_at ASC;
END;
$function$;

-- Fix the check_verified_purchase function to use proper table aliases
CREATE OR REPLACE FUNCTION public.check_verified_purchase(user_id uuid, meal_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    WHERE o.customer_id = check_verified_purchase.user_id
    AND oi.meal_id = check_verified_purchase.meal_id
    LIMIT 1
  );
$function$;

-- Fix the get_user_info function to use customer_id
CREATE OR REPLACE FUNCTION public.get_user_info()
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
    user_id UUID;  -- PL/pgSQL variable
BEGIN
    SELECT * FROM orders o WHERE o.customer_id = user_id;  -- Use proper table alias
END;
$function$;

-- Update the validate_order_status_transition trigger function
CREATE OR REPLACE FUNCTION public.validate_order_status_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Allow all transitions for now, but log them for tracking
    INSERT INTO order_history (
        order_id,
        status,
        previous_status,
        restaurant_id,
        details
    ) VALUES (
        NEW.id,
        NEW.status,
        OLD.status,
        NEW.restaurant_id,
        jsonb_build_object(
            'assignment_source', NEW.assignment_source,
            'status_change_timestamp', NOW()
        )
    );
    
    RETURN NEW;
END;
$function$;
