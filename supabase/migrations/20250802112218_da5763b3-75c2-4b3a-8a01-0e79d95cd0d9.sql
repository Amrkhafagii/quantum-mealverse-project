-- Fix the create_default_photo_album function to handle RLS properly
CREATE OR REPLACE FUNCTION public.create_default_photo_album()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Create default photo album with proper user_id handling
  INSERT INTO photo_albums (user_id, name, description, is_default, is_private)
  VALUES (NEW.id, 'My Progress', 'Default album for progress photos', true, true);
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the user creation
  RAISE WARNING 'Failed to create default photo album for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$function$;