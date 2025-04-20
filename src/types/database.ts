
// Generated types from Supabase database schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
  restaurant_assignments: {
    Row: {
      id: string
      restaurant_id: string
      order_id: string
      status: string
      expires_at: string
      created_at: string
      updated_at: string
      notes: string | null
    }
    Insert: {
      restaurant_id: string
      order_id: string
      status?: string
      expires_at: string
      notes?: string | null
    }
    Update: {
      restaurant_id?: string
      order_id?: string
      status?: string
      expires_at?: string
      notes?: string | null
    }
    Select: {
      id: string
      restaurant_id: string
      order_id: string
      status: string
      expires_at: string
      created_at: string
      updated_at: string
      notes: string | null
    }
  }
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
      restaurant_assignments: {
        Row: {
          id: string
          restaurant_id: string
          order_id: string
          status: string
          expires_at: string
          created_at: string
          updated_at: string
          notes: string | null
        }
        Insert: {
          restaurant_id: string
          order_id: string
          status?: string
          expires_at: string
          notes?: string | null
        }
        Update: {
          restaurant_id?: string
          order_id?: string
          status?: string
          expires_at?: string
          notes?: string | null
        }
        Select: {
          id: string
          restaurant_id: string
          order_id: string
          status: string
          expires_at: string
          created_at: string
          updated_at: string
          notes: string | null
        }
      }
      restaurants: {
        Row: {
          id: string
          name: string
          address: string
          user_id: string
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
          latitude: number | null
          longitude: number | null
          email: string | null
        }
        Insert: {
          id?: string
          name: string
          address: string
          user_id: string
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          latitude?: number | null
          longitude?: number | null
          email?: string | null
        }
        Update: {
          id?: string
          name?: string
          address?: string
          user_id?: string
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          latitude?: number | null
          longitude?: number | null
          email?: string | null
        }
        Select: {
          id: string
          name: string
          address: string
          user_id: string
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
          latitude: number | null
          longitude: number | null
          email: string | null
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
