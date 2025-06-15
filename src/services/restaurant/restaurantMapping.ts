
import type { Restaurant } from '@/types/restaurant';

export function mapDatabaseToRestaurant(data: any): Restaurant {
  return {
    id: data.id,
    user_id: data.restaurants_user_id,
    name: data.name,
    address: data.address,
    city: data.city,
    country: data.country,
    phone: data.phone,
    phone_number: data.phone_number,
    email: data.email,
    description: data.description,
    is_active: data.is_active,
    latitude: data.latitude,
    longitude: data.longitude,
    created_at: data.created_at,
    updated_at: data.updated_at,
    logo_url: data.logo_url,
    cover_image_url: data.cover_image_url,
    cuisine_type: data.cuisine_type,
    delivery_fee: data.delivery_fee,
    delivery_radius: data.delivery_radius,
    rating: data.rating,
    menu_url: data.menu_url,
    business_license: data.business_license,
    website_url: data.website_url,
    opening_hours: parseOpeningHours(data.opening_hours),
    payment_methods: data.payment_methods,
    terms_and_conditions: data.terms_and_conditions,
    privacy_policy: data.privacy_policy,
    cancellation_policy: data.cancellation_policy,
    verification_status: data.verification_status,
    is_verified: data.is_verified,
    onboarding_status: data.onboarding_status,
    onboarding_step: data.onboarding_step,
    onboarding_completed_at: data.onboarding_completed_at,
    postal_code: data.postal_code,
    minimum_order_amount: data.minimum_order_amount,
    estimated_delivery_time: data.estimated_delivery_time,
    verification_notes: data.verification_notes,
  };
}

export function mapRestaurantToDatabase(restaurant: Partial<Restaurant>): any {
  const dbData: any = { ...restaurant };

  if (restaurant.user_id) {
    dbData.restaurants_user_id = restaurant.user_id;
    delete dbData.user_id;
  }

  if (restaurant.opening_hours) {
    dbData.opening_hours = restaurant.opening_hours;
  }

  return dbData;
}

function parseOpeningHours(openingHours: any): { [key: string]: { open: string; close: string } } | undefined {
  if (!openingHours) return undefined;
  if (typeof openingHours === 'object' && !Array.isArray(openingHours)) {
    return openingHours as { [key: string]: { open: string; close: string } };
  }
  if (typeof openingHours === 'string') {
    try {
      return JSON.parse(openingHours);
    } catch {
      return undefined;
    }
  }
  return undefined;
}
