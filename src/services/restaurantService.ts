import { supabase } from '@/integrations/supabase/client';
import { Restaurant, VerificationDocument } from '@/types/restaurant';

// Helper function to map database row to Restaurant interface
const mapDatabaseToRestaurant = (dbRow: any): Restaurant => {
  return {
    id: dbRow.id,
    name: dbRow.name,
    address: dbRow.address,
    city: dbRow.city,
    country: dbRow.country || '',
    phone: dbRow.phone,
    phone_number: dbRow.phone_number,
    email: dbRow.email,
    description: dbRow.description,
    is_active: dbRow.is_active,
    latitude: dbRow.latitude,
    longitude: dbRow.longitude,
    created_at: dbRow.created_at,
    updated_at: dbRow.updated_at,
    user_id: dbRow.restaurants_user_id,
    logo_url: dbRow.logo_url,
    cover_image_url: dbRow.cover_image_url,
    cuisine_type: dbRow.cuisine_type,
    delivery_fee: dbRow.delivery_fee,
    delivery_radius: dbRow.delivery_radius || 10,
    rating: dbRow.rating || 0,
    menu_url: dbRow.menu_url,
    business_license: dbRow.business_license,
    website_url: dbRow.website_url,
    opening_hours: typeof dbRow.opening_hours === 'object' && dbRow.opening_hours !== null 
      ? dbRow.opening_hours as { [key: string]: { open: string; close: string } }
      : {},
    payment_methods: Array.isArray(dbRow.payment_methods) ? dbRow.payment_methods : [],
    terms_and_conditions: dbRow.terms_and_conditions,
    privacy_policy: dbRow.privacy_policy,
    cancellation_policy: dbRow.cancellation_policy,
    verification_status: dbRow.verification_status || 'pending',
    is_verified: dbRow.is_verified || false,
    onboarding_status: dbRow.onboarding_status || 'not_started',
    onboarding_step: dbRow.onboarding_step || 0,
    onboarding_completed_at: dbRow.onboarding_completed_at,
    postal_code: dbRow.postal_code,
    minimum_order_amount: dbRow.minimum_order_amount || 0,
    estimated_delivery_time: dbRow.estimated_delivery_time || 30,
    verification_notes: dbRow.verification_notes
  };
};

// Helper function to map Restaurant interface to database fields
const mapRestaurantToDatabase = (restaurant: Partial<Restaurant>) => {
  return {
    name: restaurant.name,
    address: restaurant.address,
    city: restaurant.city,
    country: restaurant.country,
    phone: restaurant.phone,
    phone_number: restaurant.phone_number,
    email: restaurant.email,
    description: restaurant.description,
    is_active: restaurant.is_active,
    latitude: restaurant.latitude,
    longitude: restaurant.longitude,
    logo_url: restaurant.logo_url,
    cover_image_url: restaurant.cover_image_url,
    cuisine_type: restaurant.cuisine_type,
    delivery_fee: restaurant.delivery_fee,
    delivery_radius: restaurant.delivery_radius,
    business_license: restaurant.business_license,
    website_url: restaurant.website_url,
    opening_hours: restaurant.opening_hours,
    payment_methods: restaurant.payment_methods,
    terms_and_conditions: restaurant.terms_and_conditions,
    privacy_policy: restaurant.privacy_policy,
    cancellation_policy: restaurant.cancellation_policy,
    verification_status: restaurant.verification_status,
    is_verified: restaurant.is_verified,
    onboarding_status: restaurant.onboarding_status,
    onboarding_step: restaurant.onboarding_step,
    onboarding_completed_at: restaurant.onboarding_completed_at,
    postal_code: restaurant.postal_code,
    minimum_order_amount: restaurant.minimum_order_amount,
    estimated_delivery_time: restaurant.estimated_delivery_time,
    verification_notes: restaurant.verification_notes,
    updated_at: new Date().toISOString()
  };
};

export const restaurantService = {
  async getRestaurants(): Promise<Restaurant[]> {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*');
    
    if (error) throw error;
    
    return (data || []).map(mapDatabaseToRestaurant);
  },

  async getRestaurant(userId: string): Promise<Restaurant> {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('restaurants_user_id', userId)
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Restaurant not found');
    
    return mapDatabaseToRestaurant(data);
  },

  async updateRestaurant(restaurantId: string, updates: Partial<Restaurant>): Promise<Restaurant> {
    const dbUpdates = mapRestaurantToDatabase(updates);
    
    const { data, error } = await supabase
      .from('restaurants')
      .update(dbUpdates)
      .eq('id', restaurantId)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Restaurant not found');
    
    return mapDatabaseToRestaurant(data);
  },

  async createRestaurant(restaurantData: Partial<Restaurant>): Promise<Restaurant> {
    const dbData = {
      restaurants_user_id: restaurantData.user_id,
      ...mapRestaurantToDatabase(restaurantData)
    };
    
    const { data, error } = await supabase
      .from('restaurants')
      .insert(dbData)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to create restaurant');
    
    return mapDatabaseToRestaurant(data);
  },

  async getRestaurantProfile(userId: string): Promise<Restaurant> {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('restaurants_user_id', userId)
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Restaurant profile not found');
    
    return mapDatabaseToRestaurant(data);
  },

  async updateRestaurantProfile(userId: string, updates: Partial<Restaurant>): Promise<Restaurant> {
    const dbUpdates = mapRestaurantToDatabase(updates);
    
    const { data, error } = await supabase
      .from('restaurants')
      .update(dbUpdates)
      .eq('restaurants_user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Restaurant not found');
    
    return mapDatabaseToRestaurant(data);
  },

  async getVerificationDocuments(restaurantId: string): Promise<VerificationDocument[]> {
    // Use schema("public") because it's likely not in the generated types
    const { data, error } = await supabase
      .schema("public")
      .from('verification_documents' as any)
      .select('*')
      .eq('restaurant_id', restaurantId);

    if (error) throw error;

    return (data || []).map((doc: any) => ({
      id: doc.id,
      restaurant_id: doc.restaurant_id,
      document_type: doc.document_type,
      document_name: doc.document_name,
      document_url: doc.document_url,
      file_url: doc.file_url,
      status: doc.status,
      verification_status: doc.verification_status,
      verification_notes: doc.verification_notes,
      uploaded_at: doc.uploaded_at,
      verified_at: doc.verified_at
    }));
  },

  async uploadVerificationDocument(restaurantId: string, documentData: {
    document_type: string;
    document_name: string;
    file_url: string;
  }): Promise<VerificationDocument> {
    const { data, error } = await supabase
      .schema("public")
      .from('verification_documents' as any)
      .insert({
        restaurant_id: restaurantId,
        document_type: documentData.document_type,
        document_name: documentData.document_name,
        document_url: documentData.file_url,
        file_url: documentData.file_url,
        status: 'pending',
        verification_status: 'pending',
        uploaded_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to upload document');

    // Allow any for unknown type due to schema("public")
    const doc: any = data;
    return {
      id: doc.id,
      restaurant_id: doc.restaurant_id,
      document_type: doc.document_type,
      document_name: doc.document_name,
      document_url: doc.document_url,
      file_url: doc.file_url,
      status: doc.status,
      verification_status: doc.verification_status,
      verification_notes: doc.verification_notes,
      uploaded_at: doc.uploaded_at,
      verified_at: doc.verified_at
    };
  },

  async deleteVerificationDocument(documentId: string): Promise<void> {
    const { error } = await supabase
      .schema("public")
      .from('verification_documents' as any)
      .delete()
      .eq('id', documentId);

    if (error) throw error;
  }
};

export { Restaurant, VerificationDocument };
// Use type-only re-exports for isolatedModules
export type { Restaurant as RestaurantType, VerificationDocument as VerificationDocumentType };
