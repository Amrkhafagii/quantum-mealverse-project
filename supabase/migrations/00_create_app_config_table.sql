
-- Create app_config table if it doesn't exist
CREATE OR REPLACE FUNCTION public.create_app_config_table()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table already exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'app_config') THEN
    RETURN true;
  END IF;

  -- Create the app_config table
  CREATE TABLE public.app_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    is_secret BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );
  
  -- Set RLS policies
  ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
  
  -- Policy: Only admin users can edit/insert
  CREATE POLICY "Admin users can do everything" ON public.app_config
    FOR ALL USING (
      public.is_admin(auth.uid())
    );
    
  -- Policy: Secrets are only visible to admin users
  CREATE POLICY "Everyone can read non-secrets" ON public.app_config
    FOR SELECT USING (
      NOT is_secret OR public.is_admin(auth.uid())
    );
  
  -- Insert the initial record for Google Maps API key
  INSERT INTO public.app_config (key, value, description, is_secret)
  VALUES ('google_maps_api_key', 'AIzaSyBKQztvlSSaT-kjpzWBHIZ1uzgRh8rPlVs', 'Google Maps API key for maps integration', true);
  
  RETURN true;
END;
$$;

-- Execute the function to create the table (will be a no-op if already exists)
SELECT create_app_config_table();

-- Create an admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only allow admins to see who else is an admin
CREATE POLICY "Admins can see admin users" ON public.admin_users
  FOR SELECT USING (
    public.is_admin(auth.uid())
  );

-- Only allow admins to manage admin users  
CREATE POLICY "Admins can manage admin users" ON public.admin_users
  FOR ALL USING (
    public.is_admin(auth.uid())
  );
