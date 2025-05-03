
-- Create a dedicated table for user types
CREATE TABLE IF NOT EXISTS public.user_types (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('customer', 'restaurant', 'delivery')),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  
  CONSTRAINT user_types_user_id_key UNIQUE (user_id)
);

-- Add RLS policies to user_types table
ALTER TABLE public.user_types ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own user type
CREATE POLICY "Users can read their own user type" 
  ON public.user_types 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to insert their own user type only once during signup
CREATE POLICY "Users can insert their own user type" 
  ON public.user_types 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own user type
CREATE POLICY "Users can update their own user type" 
  ON public.user_types 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow admins to manage all user types
CREATE POLICY "Admins can do anything with user types" 
  ON public.user_types 
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_types_user_id ON public.user_types(user_id);

-- Create function to set user type on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  IF NEW.raw_user_meta_data ? 'user_type' THEN
    INSERT INTO public.user_types (user_id, type) 
    VALUES (NEW.id, NEW.raw_user_meta_data->>'user_type')
    ON CONFLICT (user_id) DO UPDATE SET type = NEW.raw_user_meta_data->>'user_type';
  ELSE
    -- Default to customer if no user_type specified
    INSERT INTO public.user_types (user_id, type) 
    VALUES (NEW.id, 'customer')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set user type on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update existing users from metadata (run once)
CREATE OR REPLACE FUNCTION public.migrate_existing_users()
RETURNS void AS $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN 
    SELECT id, raw_user_meta_data->>'user_type' as user_type 
    FROM auth.users 
    WHERE raw_user_meta_data ? 'user_type'
  LOOP
    INSERT INTO public.user_types (user_id, type)
    VALUES (rec.id, rec.user_type)
    ON CONFLICT (user_id) DO UPDATE SET type = rec.user_type;
  END LOOP;
  
  -- For users without a user_type in metadata, set as customer
  INSERT INTO public.user_types (user_id, type)
  SELECT id, 'customer' FROM auth.users
  WHERE NOT (raw_user_meta_data ? 'user_type')
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the migration for existing users (commented out - run manually after applying migration)
-- SELECT public.migrate_existing_users();

-- Grant permissions to relevant roles
GRANT ALL ON public.user_types TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.user_types TO authenticated;
