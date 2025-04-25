
export interface ReviewMetadata {
  id?: string;
  review_user_id: string;
  review_meal_id: string;
  verification_hash: string;
  order_id: string;
  order_date: string;
  delivery_date?: string;
  experience_time?: number;  // How long user spent writing review (in seconds)
  device_info?: string;      // Basic device fingerprint
  ai_content_score?: number; // Score from AI analysis (0-100)
  keywords_detected?: string[];
  sentiment_score?: number;  // -1 to 1 scale for review sentiment
  is_rushed?: boolean;       // Flag for reviews completed very quickly
  helpful_votes?: number;    // Number of users who found review helpful
  unhelpful_votes?: number;  // Number of users who found review unhelpful
  created_at?: string;
  updated_at?: string;
}
