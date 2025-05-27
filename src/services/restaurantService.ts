
import { supabase } from '@/integrations/supabase/client';

export interface Restaurant {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code?: string;
  country: string;
  description?: string;
  cuisine_type?: string;
  logo_url?: string;
  cover_image_url?: string;
  business_license?: string;
  tax_number?: string;
  is_active: boolean;
  is_verified: boolean;
  verification_status: 'pending' | 'approved' | 'rejected' | 'under_review';
  verification_notes?: string;
  latitude?: number;
  longitude?: number;
  opening_hours?: any;
  delivery_radius: number;
  minimum_order_amount?: number;
  delivery_fee?: number;
  estimated_delivery_time: number;
  created_at: string;
  updated_at: string;
}

export interface RestaurantSettings {
  id: string;
  restaurant_id: string;
  notifications_enabled: boolean;
  auto_accept_orders: boolean;
  order_preparation_time: number;
  max_daily_orders?: number;
  operating_status: 'open' | 'busy' | 'closed' | 'temporarily_closed';
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationDocument {
  id: string;
  restaurant_id: string;
  document_type: 'business_license' | 'food_handler_permit' | 'insurance_certificate' | 'tax_document' | 'identity_document';
  document_url: string;
  document_name: string;
  uploaded_at: string;
  verified_at?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  verification_notes?: string;
}

export const restaurantService = {
  async getRestaurant(userId: string): Promise<Restaurant | null> {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async updateRestaurant(restaurantId: string, updates: Partial<Restaurant>): Promise<Restaurant> {
    const { data, error } = await supabase
      .from('restaurants')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', restaurantId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getRestaurantSettings(restaurantId: string): Promise<RestaurantSettings | null> {
    const { data, error } = await supabase
      .from('restaurant_settings')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async updateRestaurantSettings(restaurantId: string, settings: Partial<RestaurantSettings>): Promise<RestaurantSettings> {
    const { data, error } = await supabase
      .from('restaurant_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('restaurant_id', restaurantId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async uploadVerificationDocument(
    restaurantId: string,
    file: File,
    documentType: VerificationDocument['document_type']
  ): Promise<VerificationDocument> {
    // Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${restaurantId}/${documentType}_${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('restaurant-documents')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('restaurant-documents')
      .getPublicUrl(fileName);
    
    // Create document record
    const { data, error } = await supabase
      .from('restaurant_verification_documents')
      .insert({
        restaurant_id: restaurantId,
        document_type: documentType,
        document_url: publicUrl,
        document_name: file.name
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getVerificationDocuments(restaurantId: string): Promise<VerificationDocument[]> {
    const { data, error } = await supabase
      .from('restaurant_verification_documents')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('uploaded_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async deleteVerificationDocument(documentId: string): Promise<void> {
    const { error } = await supabase
      .from('restaurant_verification_documents')
      .delete()
      .eq('id', documentId);
    
    if (error) throw error;
  }
};
