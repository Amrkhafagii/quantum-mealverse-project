
-- Add trial-related fields to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN is_trial BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster querying of trial subscriptions
CREATE INDEX idx_subscriptions_is_trial ON public.subscriptions(is_trial);
CREATE INDEX idx_subscriptions_trial_ends_at ON public.subscriptions(trial_ends_at);

-- Add comments for better documentation
COMMENT ON COLUMN public.subscriptions.is_trial IS 'Indicates if this subscription is a free trial';
COMMENT ON COLUMN public.subscriptions.trial_ends_at IS 'Date when the free trial period ends';

-- Update the subscription table's RLS policies to ensure they work with the new fields
ALTER POLICY "Users can view their own subscriptions" 
  ON public.subscriptions 
  USING (auth.uid() = user_id);

ALTER POLICY "Users can update their own subscriptions" 
  ON public.subscriptions 
  USING (auth.uid() = user_id);

ALTER POLICY "Users can insert their own subscriptions" 
  ON public.subscriptions 
  WITH CHECK (auth.uid() = user_id);
