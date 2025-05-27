import { supabase } from '@/integrations/supabase/client';
import { fromSupabaseJson, toSupabaseJson } from '@/utils/supabaseUtils';
import type { 
  RestaurantDocument, 
  OperationalHours, 
  DeliveryArea, 
  OnboardingProgress 
} from '@/types/onboarding';

export class OnboardingService {
  // Document Management
  async uploadDocument(
    restaurantId: string,
    file: File,
    documentType: RestaurantDocument['document_type']
  ): Promise<RestaurantDocument> {
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
      .from('restaurant_documents')
      .insert({
        restaurant_id: restaurantId,
        document_type: documentType,
        document_name: file.name,
        document_url: publicUrl,
        file_size: file.size,
        file_type: file.type
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as RestaurantDocument;
  }

  async getRestaurantDocuments(restaurantId: string): Promise<RestaurantDocument[]> {
    const { data, error } = await supabase
      .from('restaurant_documents')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as RestaurantDocument[];
  }

  async deleteDocument(documentId: string): Promise<void> {
    const { error } = await supabase
      .from('restaurant_documents')
      .delete()
      .eq('id', documentId);
    
    if (error) throw error;
  }

  // Operational Hours Management
  async saveOperationalHours(
    restaurantId: string,
    hours: Omit<OperationalHours, 'id' | 'restaurant_id' | 'created_at' | 'updated_at'>[]
  ): Promise<OperationalHours[]> {
    // Delete existing hours
    await supabase
      .from('restaurant_operational_hours')
      .delete()
      .eq('restaurant_id', restaurantId);

    // Insert new hours
    const hoursData = hours.map(hour => ({
      restaurant_id: restaurantId,
      ...hour
    }));

    const { data, error } = await supabase
      .from('restaurant_operational_hours')
      .insert(hoursData)
      .select();
    
    if (error) throw error;
    return (data || []) as OperationalHours[];
  }

  async getOperationalHours(restaurantId: string): Promise<OperationalHours[]> {
    const { data, error } = await supabase
      .from('restaurant_operational_hours')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('day_of_week');
    
    if (error) throw error;
    return (data || []) as OperationalHours[];
  }

  // Delivery Areas Management
  async saveDeliveryArea(
    restaurantId: string,
    area: Omit<DeliveryArea, 'id' | 'restaurant_id' | 'created_at' | 'updated_at'>
  ): Promise<DeliveryArea> {
    const areaData = {
      restaurant_id: restaurantId,
      ...area,
      polygon_coordinates: area.polygon_coordinates ? toSupabaseJson(area.polygon_coordinates) : null,
      postal_codes: area.postal_codes || null
    };

    const { data, error } = await supabase
      .from('restaurant_delivery_areas')
      .insert(areaData)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      polygon_coordinates: data.polygon_coordinates ? fromSupabaseJson(data.polygon_coordinates) : undefined,
      postal_codes: data.postal_codes || undefined
    } as DeliveryArea;
  }

  async getDeliveryAreas(restaurantId: string): Promise<DeliveryArea[]> {
    const { data, error } = await supabase
      .from('restaurant_delivery_areas')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('priority_order');
    
    if (error) throw error;
    
    return (data || []).map(area => ({
      ...area,
      polygon_coordinates: area.polygon_coordinates ? fromSupabaseJson(area.polygon_coordinates) : undefined,
      postal_codes: area.postal_codes || undefined
    })) as DeliveryArea[];
  }

  async updateDeliveryArea(
    areaId: string,
    updates: Partial<Omit<DeliveryArea, 'id' | 'restaurant_id' | 'created_at' | 'updated_at'>>
  ): Promise<DeliveryArea> {
    const updateData = {
      ...updates,
      polygon_coordinates: updates.polygon_coordinates ? toSupabaseJson(updates.polygon_coordinates) : undefined,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('restaurant_delivery_areas')
      .update(updateData)
      .eq('id', areaId)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      polygon_coordinates: data.polygon_coordinates ? fromSupabaseJson(data.polygon_coordinates) : undefined,
      postal_codes: data.postal_codes || undefined
    } as DeliveryArea;
  }

  async deleteDeliveryArea(areaId: string): Promise<void> {
    const { error } = await supabase
      .from('restaurant_delivery_areas')
      .delete()
      .eq('id', areaId);
    
    if (error) throw error;
  }

  // Onboarding Progress Management
  async updateProgress(
    restaurantId: string,
    stepName: string,
    stepNumber: number,
    isCompleted: boolean,
    data?: Record<string, any>,
    notes?: string
  ): Promise<OnboardingProgress> {
    const progressData = {
      restaurant_id: restaurantId,
      step_name: stepName,
      step_number: stepNumber,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      data: data ? toSupabaseJson(data) : null,
      notes
    };

    const { data: result, error } = await supabase
      .from('restaurant_onboarding_progress')
      .upsert(progressData, {
        onConflict: 'restaurant_id,step_name'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      ...result,
      data: result.data ? fromSupabaseJson(result.data as string) : undefined
    } as OnboardingProgress;
  }

  async getProgress(restaurantId: string): Promise<OnboardingProgress[]> {
    const { data, error } = await supabase
      .from('restaurant_onboarding_progress')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('step_number');
    
    if (error) throw error;
    
    return (data || []).map(progress => ({
      ...progress,
      data: progress.data ? fromSupabaseJson(progress.data as string) : undefined
    })) as OnboardingProgress[];
  }

  // Finalize onboarding
  async submitForReview(restaurantId: string): Promise<void> {
    const { error } = await supabase
      .from('restaurants')
      .update({
        onboarding_status: 'pending_review',
        onboarding_completed_at: new Date().toISOString()
      })
      .eq('id', restaurantId);
    
    if (error) throw error;
  }
}

export const onboardingService = new OnboardingService();
