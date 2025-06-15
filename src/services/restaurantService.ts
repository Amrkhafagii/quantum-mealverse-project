
import { supabase } from '@/integrations/supabase/client';

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: string;
  country?: string;
  phone?: string;
  phone_number?: string;
  email: string;
  description?: string;
  is_active: boolean;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
  user_id: string;
  logo_url?: string;
  cover_image_url?: string;
  cuisine_type?: string;
  delivery_fee?: number;
  delivery_radius?: number;
  rating?: number;
  menu_url?: string;
  business_license?: string;
  website_url?: string;
  opening_hours?: {
    [key: string]: { open: string; close: string }
  };
  payment_methods?: string[];
  terms_and_conditions?: string;
  privacy_policy?: string;
  cancellation_policy?: string;
  verification_status?: string;
  is_verified?: boolean;
  onboarding_status?: string;
  onboarding_step?: number;
  onboarding_completed_at?: string;
  postal_code?: string;
  minimum_order_amount?: number;
  estimated_delivery_time?: number;
  verification_notes?: string;
}

export interface VerificationDocument {
  id: string;
  restaurant_id: string;
  document_type: string;
  document_name?: string;
  document_url?: string;
  file_url: string;
  status: string;
  verification_status?: string;
  verification_notes?: string;
  uploaded_at: string;
  verified_at?: string;
}

export const getRestaurants = async (): Promise<Restaurant[]> => {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*');

  if (error) {
    console.error("Error fetching restaurants:", error);
    throw error;
  }

  return (data || []).map(restaurant => ({
    ...restaurant,
    user_id: restaurant.restaurants_user_id,
    name: restaurant.name || 'Unnamed Restaurant',
    address: restaurant.address || 'No Address',
    city: restaurant.city || 'Unknown',
    cuisine_type: restaurant.cuisine_type || 'Unknown',
    delivery_fee: restaurant.delivery_fee || 0,
    delivery_radius: restaurant.delivery_radius || 0,
    rating: restaurant.rating || 0,
    menu_url: restaurant.menu_url || '',
    cover_image_url: restaurant.cover_image_url || '',
    is_active: restaurant.is_active !== false,
    created_at: restaurant.created_at || new Date().toISOString(),
    updated_at: restaurant.updated_at || new Date().toISOString(),
    opening_hours: restaurant.opening_hours || {},
    postal_code: restaurant.postal_code,
    minimum_order_amount: restaurant.minimum_order_amount,
    estimated_delivery_time: restaurant.estimated_delivery_time,
    verification_notes: restaurant.verification_notes,
  })) as Restaurant[];
};

export const getRestaurantProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('restaurants_user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return {
      ...data,
      user_id: data.restaurants_user_id,
      name: data.name || 'Unnamed Restaurant',
      address: data.address || 'No Address',
      city: data.city || 'Unknown',
      cuisine_type: data.cuisine_type || 'Unknown',
      delivery_fee: data.delivery_fee || 0,
      delivery_radius: data.delivery_radius || 0,
      rating: data.rating || 0,
      menu_url: data.menu_url || '',
      cover_image_url: data.cover_image_url || '',
      is_active: data.is_active !== false,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
      opening_hours: data.opening_hours || {},
      postal_code: data.postal_code,
      minimum_order_amount: data.minimum_order_amount,
      estimated_delivery_time: data.estimated_delivery_time,
      verification_notes: data.verification_notes,
    };
  } catch (error) {
    console.error("Error fetching restaurant profile:", error);
    throw error;
  }
};

export const updateRestaurantProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('restaurants_user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      user_id: data.restaurants_user_id,
      name: data.name || 'Unnamed Restaurant',
      address: data.address || 'No Address',
      city: data.city || 'Unknown',
      cuisine_type: data.cuisine_type || 'Unknown',
      delivery_fee: data.delivery_fee || 0,
      delivery_radius: data.delivery_radius || 0,
      rating: data.rating || 0,
      menu_url: data.menu_url || '',
      cover_image_url: data.cover_image_url || '',
      is_active: data.is_active !== false,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
      opening_hours: data.opening_hours || {},
      postal_code: data.postal_code,
      minimum_order_amount: data.minimum_order_amount,
      estimated_delivery_time: data.estimated_delivery_time,
      verification_notes: data.verification_notes,
    };
  } catch (error) {
    console.error("Error updating restaurant profile:", error);
    throw error;
  }
};

export const createRestaurant = async (restaurantData: Partial<Restaurant>): Promise<Restaurant> => {
  try {
    const insertData = {
      restaurants_user_id: restaurantData.user_id,
      name: restaurantData.name,
      address: restaurantData.address,
      city: restaurantData.city,
      country: restaurantData.country,
      cuisine_type: restaurantData.cuisine_type,
      delivery_fee: restaurantData.delivery_fee,
      delivery_radius: restaurantData.delivery_radius,
      cover_image_url: restaurantData.cover_image_url,
      is_active: restaurantData.is_active,
      business_license: restaurantData.business_license,
      phone: restaurantData.phone_number || restaurantData.phone,
      email: restaurantData.email,
      website_url: restaurantData.website_url,
      opening_hours: restaurantData.opening_hours,
      payment_methods: restaurantData.payment_methods,
      description: restaurantData.description,
      terms_and_conditions: restaurantData.terms_and_conditions,
      privacy_policy: restaurantData.privacy_policy,
      cancellation_policy: restaurantData.cancellation_policy,
      verification_status: restaurantData.verification_status,
      postal_code: restaurantData.postal_code,
      minimum_order_amount: restaurantData.minimum_order_amount,
      estimated_delivery_time: restaurantData.estimated_delivery_time,
    };

    const { data, error } = await supabase
      .from('restaurants')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error creating restaurant:", error);
      throw error;
    }

    return {
      ...data,
      user_id: data.restaurants_user_id,
      name: data.name || 'Unnamed Restaurant',
      address: data.address || 'No Address',
      city: data.city || 'Unknown',
      cuisine_type: data.cuisine_type || 'Unknown',
      delivery_fee: data.delivery_fee || 0,
      delivery_radius: data.delivery_radius || 0,
      rating: data.rating || 0,
      menu_url: data.menu_url || '',
      cover_image_url: data.cover_image_url || '',
      is_active: data.is_active !== false,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
      opening_hours: data.opening_hours || {},
      postal_code: data.postal_code,
      minimum_order_amount: data.minimum_order_amount,
      estimated_delivery_time: data.estimated_delivery_time,
      verification_notes: data.verification_notes,
    } as Restaurant;
  } catch (error) {
    console.error("Error creating restaurant:", error);
    throw error;
  }
};

export const updateRestaurant = async (restaurantId: string, updates: Partial<Restaurant>): Promise<Restaurant> => {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .update(updates)
      .eq('id', restaurantId)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      user_id: data.restaurants_user_id,
      name: data.name || 'Unnamed Restaurant',
      address: data.address || 'No Address',
      city: data.city || 'Unknown',
      cuisine_type: data.cuisine_type || 'Unknown',
      delivery_fee: data.delivery_fee || 0,
      delivery_radius: data.delivery_radius || 0,
      rating: data.rating || 0,
      menu_url: data.menu_url || '',
      cover_image_url: data.cover_image_url || '',
      is_active: data.is_active !== false,
      created_at: data.created_at || new Date().toISOString(),
      updated_at: data.updated_at || new Date().toISOString(),
      opening_hours: data.opening_hours || {},
      postal_code: data.postal_code,
      minimum_order_amount: data.minimum_order_amount,
      estimated_delivery_time: data.estimated_delivery_time,
      verification_notes: data.verification_notes,
    } as Restaurant;
  } catch (error) {
    console.error("Error updating restaurant:", error);
    throw error;
  }
};

export const getRestaurant = async (userId: string): Promise<Restaurant | null> => {
  return getRestaurantProfile(userId);
};

export const getVerificationDocuments = async (restaurantId: string): Promise<VerificationDocument[]> => {
  try {
    const { data, error } = await supabase
      .from('delivery_documents')
      .select('*')
      .eq('delivery_user_id', restaurantId);

    if (error) throw error;

    return (data || []).map(doc => ({
      id: doc.id,
      restaurant_id: restaurantId,
      document_type: doc.document_type,
      document_name: doc.file_path?.split('/').pop() || 'Document',
      document_url: doc.file_path,
      file_url: doc.file_path,
      status: doc.verified ? 'approved' : 'pending',
      verification_status: doc.verified ? 'approved' : 'pending',
      verification_notes: doc.notes,
      uploaded_at: doc.created_at,
      verified_at: doc.verified ? doc.updated_at : undefined,
    }));
  } catch (error) {
    console.error("Error fetching verification documents:", error);
    return [];
  }
};

export const uploadVerificationDocument = async (
  restaurantId: string, 
  file: File, 
  documentType: string
): Promise<VerificationDocument> => {
  try {
    // For now, return a mock document since we don't have the upload infrastructure
    const mockDoc: VerificationDocument = {
      id: `mock-${Date.now()}`,
      restaurant_id: restaurantId,
      document_type: documentType,
      document_name: file.name,
      document_url: `/uploads/${file.name}`,
      file_url: `/uploads/${file.name}`,
      status: 'pending',
      verification_status: 'pending',
      uploaded_at: new Date().toISOString(),
    };
    return mockDoc;
  } catch (error) {
    console.error("Error uploading verification document:", error);
    throw error;
  }
};

export const deleteVerificationDocument = async (documentId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('delivery_documents')
      .delete()
      .eq('id', documentId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting verification document:", error);
    throw error;
  }
};

// Create a restaurant service object for backward compatibility
export const restaurantService = {
  getRestaurant,
  updateRestaurant,
  createRestaurant,
  getRestaurantProfile,
  updateRestaurantProfile,
  getRestaurants,
  getVerificationDocuments,
  uploadVerificationDocument,
  deleteVerificationDocument,
};
