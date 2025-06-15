
-- Fix trigger function that references non-existent order_status_history table
-- Update track_order_status_change function to use the correct table name
CREATE OR REPLACE FUNCTION public.track_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Insert into order_history table for tracking (not order_status_history)
    INSERT INTO order_history (
        order_id,
        status,
        previous_status,
        created_at,
        details
    ) VALUES (
        NEW.order_id,
        NEW.status,
        OLD.status,
        NOW(),
        jsonb_build_object(
            'stage_name', NEW.stage_name,
            'completed_at', NEW.completed_at,
            'actual_duration_minutes', NEW.actual_duration_minutes
        )
    );
    
    RETURN NEW;
END;
$function$;

-- Check if there's a trigger on order_preparation_stages that might be causing this
-- If the trigger exists, recreate it properly
DROP TRIGGER IF EXISTS track_preparation_stage_changes ON order_preparation_stages;

CREATE TRIGGER track_preparation_stage_changes
    AFTER UPDATE ON order_preparation_stages
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION track_order_status_change();
