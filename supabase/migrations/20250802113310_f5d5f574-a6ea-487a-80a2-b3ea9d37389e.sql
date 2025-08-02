-- Add missing INSERT policy for user_profiles table
CREATE POLICY "Users can insert their own profile" 
ON user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);