
-- Create review_metadata table for storing enhanced verification details
CREATE TABLE IF NOT EXISTS public.review_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_user_id UUID NOT NULL,
  review_meal_id UUID NOT NULL,
  verification_hash TEXT NOT NULL,
  order_id UUID NOT NULL,
  order_date TIMESTAMP WITH TIME ZONE NOT NULL,
  delivery_date TIMESTAMP WITH TIME ZONE,
  experience_time INTEGER DEFAULT 0, -- Time spent writing review in seconds
  device_info TEXT,
  ai_content_score INTEGER,
  keywords_detected TEXT[],
  sentiment_score REAL,
  is_rushed BOOLEAN DEFAULT FALSE,
  helpful_votes INTEGER DEFAULT 0,
  unhelpful_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT review_metadata_unique UNIQUE (review_user_id, review_meal_id),
  CONSTRAINT fk_review_user FOREIGN KEY (review_user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_meal FOREIGN KEY (review_meal_id) REFERENCES meals(id) ON DELETE CASCADE,
  CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Create review_votes table for tracking helpful/unhelpful votes
CREATE TABLE IF NOT EXISTS public.review_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL,
  user_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'unhelpful')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT review_votes_unique UNIQUE (review_id, user_id),
  CONSTRAINT fk_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add some indexes for performance
CREATE INDEX IF NOT EXISTS idx_review_metadata_user_meal ON public.review_metadata(review_user_id, review_meal_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON public.review_votes(review_id);

-- Create function to check if a review is "rushed"
CREATE OR REPLACE FUNCTION check_rushed_review() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.experience_time < 60 THEN -- Less than 60 seconds spent reviewing
    NEW.is_rushed := TRUE;
  ELSE
    NEW.is_rushed := FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-set is_rushed flag
CREATE TRIGGER set_rushed_review_flag
  BEFORE INSERT OR UPDATE ON review_metadata
  FOR EACH ROW
  EXECUTE FUNCTION check_rushed_review();

-- Add comments to tables for documentation
COMMENT ON TABLE public.review_metadata IS 'Stores enhanced verification and quality metrics for reviews';
COMMENT ON TABLE public.review_votes IS 'Tracks helpful/unhelpful votes on reviews';
