
-- Create the subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  meals_per_week INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to view only their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to update their own subscriptions
CREATE POLICY "Users can update their own subscriptions"
  ON public.subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to insert their own subscriptions
CREATE POLICY "Users can insert their own subscriptions"
  ON public.subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION public.update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_subscription_updated_at();

-- Allow admins to manage all subscriptions
CREATE POLICY "Admins can manage all subscriptions"
  ON public.subscriptions
  USING (
    EXISTS (
      SELECT 1
      FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email IN (
        SELECT email FROM public.admin_users
      )
    )
  );

-- Insert some sample subscriptions for demo purposes
INSERT INTO public.subscriptions (user_id, plan_name, price, status, start_date, meals_per_week)
SELECT 
  auth.uid(), 
  'Pro Zenith', 
  179.00, 
  'active', 
  now() - interval '30 days', 
  10
FROM auth.users
WHERE auth.users.email = 'demo@example.com'
ON CONFLICT DO NOTHING;

