
import { supabase } from '@/integrations/supabase/client';
import { getBrowserLocation } from '@/utils/webGeolocation';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export type UserType = 'customer' | 'restaurant' | 'delivery';

export class LocationService {
  /**
   * Request location permission and get current coordinates
   */
  static async getCurrentLocation(): Promise<LocationCoordinates> {
    try {
      const location = await getBrowserLocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
      
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy || undefined
      };
    } catch (error) {
      console.error('Failed to get current location:', error);
      throw new Error('Location permission denied or unavailable');
    }
  }

  /**
   * Update user location based on user type
   */
  static async updateUserLocation(userType: UserType, userId: string, coordinates: LocationCoordinates): Promise<void> {
    console.log(`Updating location for ${userType} user:`, userId, coordinates);
    
    try {
      switch (userType) {
        case 'restaurant':
          await this.updateRestaurantLocation(userId, coordinates);
          break;
        case 'delivery':
          await this.updateDeliveryUserLocation(userId, coordinates);
          break;
        case 'customer':
          await this.updateCustomerLocation(userId, coordinates);
          break;
        default:
          throw new Error(`Unknown user type: ${userType}`);
      }
      
      console.log(`Successfully updated location for ${userType} user`);
    } catch (error) {
      console.error(`Failed to update location for ${userType} user:`, error);
      throw error;
    }
  }

  /**
   * Update restaurant location in restaurants table
   */
  private static async updateRestaurantLocation(userId: string, coordinates: LocationCoordinates): Promise<void> {
    const { error } = await supabase
      .from('restaurants')
      .update({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      })
      .eq('restaurants_user_id', userId);

    if (error) {
      throw new Error(`Failed to update restaurant location: ${error.message}`);
    }
  }

  /**
   * Update delivery user location in delivery_users table
   */
  private static async updateDeliveryUserLocation(userId: string, coordinates: LocationCoordinates): Promise<void> {
    const { error } = await supabase
      .from('delivery_users')
      .update({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to update delivery user location: ${error.message}`);
    }
  }

  /**
   * Update customer location in user_locations table
   */
  private static async updateCustomerLocation(userId: string, coordinates: LocationCoordinates): Promise<void> {
    const { error } = await supabase
      .from('user_locations')
      .upsert({
        user_id: userId,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        accuracy: coordinates.accuracy,
        updated_at: new Date().toISOString()
      });

    if (error) {
      throw new Error(`Failed to update customer location: ${error.message}`);
    }
  }

  /**
   * Request location permission and update user location
   */
  static async requestLocationAndUpdate(userType: UserType, userId: string): Promise<LocationCoordinates> {
    try {
      const coordinates = await this.getCurrentLocation();
      await this.updateUserLocation(userType, userId, coordinates);
      return coordinates;
    } catch (error) {
      console.error('Failed to request location and update:', error);
      throw error;
    }
  }
}
