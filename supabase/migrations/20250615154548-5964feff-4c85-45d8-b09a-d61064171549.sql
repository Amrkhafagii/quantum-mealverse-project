
-- Fix type mismatch in get_pending_restaurant_assignments function
DROP FUNCTION IF EXISTS public.get_pending_restaurant_assignments(uuid);

-- Create the function with correct return types matching the database schema
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
    assignment_source character varying(50),  -- Fixed: changed from text to character varying(50)
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
