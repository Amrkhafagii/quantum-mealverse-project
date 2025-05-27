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
  onboarding_status?: string;
  onboarding_step?: number;
  onboarding_completed_at?: string;
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
    
    if (!data) return null;
    
    // Transform database response to match Restaurant interface with proper defaults
    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      postal_code: data.postal_code,
      country: data.country,
      description: data.description,
      cuisine_type: data.cuisine_type,
      logo_url: data.logo_url,
      cover_image_url: data.cover_image_url,
      business_license: data.business_license,
      tax_number: data.tax_number,
      is_active: data.is_active,
      is_verified: data.is_verified,
      verification_status: (data.verification_status as 'pending' | 'approved' | 'rejected' | 'under_review') || 'pending',
      verification_notes: data.verification_notes,
      latitude: data.latitude,
      longitude: data.longitude,
      opening_hours: data.opening_hours,
      delivery_radius: data.delivery_radius || 10,
      minimum_order_amount: data.minimum_order_amount,
      delivery_fee: data.delivery_fee,
      estimated_delivery_time: data.estimated_delivery_time || 45,
      onboarding_status: data.onboarding_status || 'not_started',
      onboarding_step: data.onboarding_step || 1,
      onboarding_completed_at: data.onboarding_completed_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
    } as Restaurant;
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
    
    // Transform database response to match Restaurant interface with proper defaults
    return {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      postal_code: data.postal_code,
      country: data.country,
      description: data.description,
      cuisine_type: data.cuisine_type,
      logo_url: data.logo_url,
      cover_image_url: data.cover_image_url,
      business_license: data.business_license,
      tax_number: data.tax_number,
      is_active: data.is_active,
      is_verified: data.is_verified,
      verification_status: (data.verification_status as 'pending' | 'approved' | 'rejected' | 'under_review') || 'pending',
      verification_notes: data.verification_notes,
      latitude: data.latitude,
      longitude: data.longitude,
      opening_hours: data.opening_hours,
      delivery_radius: data.delivery_radius || 10,
      minimum_order_amount: data.minimum_order_amount,
      delivery_fee: data.delivery_fee,
      estimated_delivery_time: data.estimated_delivery_time || 45,
      created_at: data.created_at,
      updated_at: data.updated_at,
    } as Restaurant;
  },

  async getRestaurantSettings(restaurantId: string): Promise<RestaurantSettings | null> {
    const { data, error } = await supabase
      .from('restaurant_settings')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .maybeSingle();
    
    if (error) throw error;
    
    if (!data) return null;
    
    return {
      id: data.id,
      restaurant_id: data.restaurant_id,
      notifications_enabled: data.notifications_enabled,
      auto_accept_orders: data.auto_accept_orders,
      order_preparation_time: data.order_preparation_time,
      max_daily_orders: data.max_daily_orders,
      operating_status: (data.operating_status as 'open' | 'busy' | 'closed' | 'temporarily_closed') || 'open',
      special_instructions: data.special_instructions,
      created_at: data.created_at,
      updated_at: data.updated_at,
    } as RestaurantSettings;
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
    
    return {
      id: data.id,
      restaurant_id: data.restaurant_id,
      notifications_enabled: data.notifications_enabled,
      auto_accept_orders: data.auto_accept_orders,
      order_preparation_time: data.order_preparation_time,
      max_daily_orders: data.max_daily_orders,
      operating_status: (data.operating_status as 'open' | 'busy' | 'closed' | 'temporarily_closed') || 'open',
      special_instructions: data.special_instructions,
      created_at: data.created_at,
      updated_at: data.updated_at,
    } as RestaurantSettings;
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
    
    return {
      id: data.id,
      restaurant_id: data.restaurant_id,
      document_type: data.document_type as VerificationDocument['document_type'],
      document_url: data.document_url,
      document_name: data.document_name,
      uploaded_at: data.uploaded_at,
      verified_at: data.verified_at,
      verification_status: (data.verification_status as 'pending' | 'approved' | 'rejected') || 'pending',
      verification_notes: data.verification_notes,
    } as VerificationDocument;
  },

  async getVerificationDocuments(restaurantId: string): Promise<VerificationDocument[]> {
    const { data, error } = await supabase
      .from('restaurant_verification_documents')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('uploaded_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(doc => ({
      id: doc.id,
      restaurant_id: doc.restaurant_id,
      document_type: doc.document_type as VerificationDocument['document_type'],
      document_url: doc.document_url,
      document_name: doc.document_name,
      uploaded_at: doc.uploaded_at,
      verified_at: doc.verified_at,
      verification_status: (doc.verification_status as 'pending' | 'approved' | 'rejected') || 'pending',
      verification_notes: doc.verification_notes,
    })) as VerificationDocument[];
  },

  async deleteVerificationDocument(documentId: string): Promise<void> {
    const { error } = await supabase
      .from('restaurant_verification_documents')
      .delete()
      .eq('id', documentId);
    
    if (error) throw error;
  },
  async checkOnboardingStatus(restaurantId: string): Promise<{
    status: string;
    currentStep: number;
    completedSteps: string[];
    totalSteps: number;
  }> {
    const { data: progressData, error } = await supabase
      .from('restaurant_onboarding_progress')
      .select('*')
      .eq('restaurant_id', restaurantId);
    
    if (error) throw error;
    
    const completedSteps = (progressData || [])
      .filter(p => p.is_completed)
      .map(p => p.step_name);
    
    const { data: restaurantData, error: restaurantError } = await supabase
      .from('restaurants')
      .select('onboarding_status, onboarding_step')
      .eq('id', restaurantId)
      .single();
    
    if (restaurantError) throw restaurantError;
    
    return {
      status: restaurantData.onboarding_status || 'not_started',
      currentStep: restaurantData.onboarding_step || 1,
      completedSteps,
      totalSteps: 5
    };
  }
};
