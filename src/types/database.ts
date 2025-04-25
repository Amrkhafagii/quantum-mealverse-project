// Generated types from Supabase database schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      order_items: {
        Row: {
          id: string
          order_id: string
          meal_id: string
          quantity: number
          price: number
          name: string
          created_at: string
          user_id: string | null
        }
        Insert: {
          order_id: string
          meal_id: string
          quantity: number
          price: number
          name: string
          user_id?: string | null
        }
        Update: {
          order_id?: string
          meal_id?: string
          quantity?: number
          price?: number
          name?: string
          user_id?: string | null
        }
        Select: {
          id: string
          order_id: string
          meal_id: string
          quantity: number
          price: number
          name: string
          created_at: string
          user_id: string | null
        }
      }
      meal_ratings: {
        Row: {
          meal_id: string
          restaurant_id: string
          avg_rating: number
          review_count: number
          rating_distribution: Json | null
          last_updated: string
        }
        Insert: {
          meal_id: string
          restaurant_id: string
          avg_rating: number
          review_count: number
          rating_distribution?: Json | null
          last_updated: string
        }
        Update: {
          meal_id?: string
          restaurant_id?: string
          avg_rating?: number
          review_count?: number
          rating_distribution?: Json | null
          last_updated?: string
        }
        Select: {
          meal_id: string
          restaurant_id: string
          avg_rating: number
          review_count: number
          rating_distribution: Json | null
          last_updated: string
        }
      }
      global_meal_ratings: {
        Row: {
          meal_id: string
          avg_rating: number
          review_count: number
          rating_distribution: Json | null
          last_updated: string
        }
        Insert: {
          meal_id: string
          avg_rating: number
          review_count: number
          rating_distribution?: Json | null
          last_updated: string
        }
        Update: {
          meal_id?: string
          avg_rating?: number
          review_count?: number
          rating_distribution?: Json | null
          last_updated?: string
        }
        Select: {
          meal_id: string
          avg_rating: number
          review_count: number
          rating_distribution: Json | null
          last_updated: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          meal_id: string
          restaurant_id: string
          rating: number
          comment: string | null
          images: string[] | null
          is_verified_purchase: boolean
          created_at: string
          updated_at: string
          is_flagged: boolean
          status: string
        }
        Insert: {
          user_id: string
          meal_id: string
          restaurant_id: string
          rating: number
          comment?: string | null
          images?: string[] | null
          is_verified_purchase: boolean
          is_flagged: boolean
          status: string
        }
        Update: {
          user_id?: string
          meal_id?: string
          restaurant_id?: string
          rating?: number
          comment?: string | null
          images?: string[] | null
          is_verified_purchase?: boolean
          is_flagged?: boolean
          status?: string
        }
        Select: {
          id: string
          user_id: string
          meal_id: string
          restaurant_id: string
          rating: number
          comment: string | null
          images: string[] | null
          is_verified_purchase: boolean
          created_at: string
          updated_at: string
          is_flagged: boolean
          status: string
        }
      }
      review_metadata: {
        Row: {
          id: string
          review_user_id: string
          review_meal_id: string
          verification_hash: string
          order_id: string
          order_date: string
          delivery_date: string | null
          experience_time: number | null
          device_info: string | null
          ai_content_score: number | null
          keywords_detected: string[] | null
          sentiment_score: number | null
          is_rushed: boolean | null
          helpful_votes: number | null
          unhelpful_votes: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          review_user_id: string
          review_meal_id: string
          verification_hash: string
          order_id: string
          order_date: string
          delivery_date?: string | null
          experience_time?: number | null
          device_info?: string | null
          ai_content_score?: number | null
          keywords_detected?: string[] | null
          sentiment_score?: number | null
          is_rushed?: boolean | null
          helpful_votes?: number | null
          unhelpful_votes?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          review_user_id?: string
          review_meal_id?: string
          verification_hash?: string
          order_id?: string
          order_date?: string
          delivery_date?: string | null
          experience_time?: number | null
          device_info?: string | null
          ai_content_score?: number | null
          keywords_detected?: string[] | null
          sentiment_score?: number | null
          is_rushed?: boolean | null
          helpful_votes?: number | null
          unhelpful_votes?: number | null
          updated_at?: string
        }
        Select: {
          id: string
          review_user_id: string
          review_meal_id: string
          verification_hash: string
          order_id: string
          order_date: string
          delivery_date: string | null
          experience_time: number | null
          device_info: string | null
          ai_content_score: number | null
          keywords_detected: string[] | null
          sentiment_score: number | null
          is_rushed: boolean | null
          helpful_votes: number | null
          unhelpful_votes: number | null
          created_at: string
          updated_at: string
        }
      }
      review_votes: {
        Row: {
          id: string
          review_id: string
          user_id: string
          vote_type: string
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          user_id: string
          vote_type: string
          created_at?: string
        }
        Update: {
          review_id?: string
          user_id?: string
          vote_type?: string
          created_at?: string
        }
        Select: {
          id: string
          review_id: string
          user_id: string
          vote_type: string
          created_at: string
        }
      }
      restaurant_assignments: {
        Row: {
          id: string
          restaurant_id: string
          order_id: string
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          restaurant_id: string
          order_id: string
          status: string
          notes?: string | null
        }
        Update: {
          restaurant_id?: string
          order_id?: string
          status?: string
          notes?: string | null
        }
        Select: {
          id: string
          restaurant_id: string
          order_id: string
          status: string
          notes: string | null
          created_at: string
          restaurants?: {
            id: string
            name: string
          }
        }
      }
    }
    Functions: {
      check_verified_purchase: {
        Args: {
          user_id: string
          meal_id: string
        }
        Returns: boolean
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type TablesRow<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

export type DbFunctions<T extends keyof Database['public']['Functions']> = Database['public']['Functions'][T]
