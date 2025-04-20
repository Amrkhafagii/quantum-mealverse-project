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
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database & { public: { tables: never } })
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["tables"]
    : PublicTableNameOrOptions extends keyof (Database & { public: { tables: never } })
      ? keyof (Database & { public: { tables: never } })[PublicTableNameOrOptions]["tables"]
      : never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["tables"][TableName]
  : PublicTableNameOrOptions extends keyof (Database & { public: { tables: never } })
    ? (Database & { public: { tables: never } })[PublicTableNameOrOptions]["tables"][TableName]
    : never
