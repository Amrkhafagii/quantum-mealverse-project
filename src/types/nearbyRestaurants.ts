
export interface NearbyRestaurantsRow {
  id: string;
  user_id: string;
  user_latitude: number;
  user_longitude: number;
  created_at: string;
  locations: NearbyRestaurantLocation[];
}

export interface NearbyRestaurantLocation {
  id: string;
  nearby_restaurants_id: string;
  restaurant_id: string;
  restaurant_latitude: number;
  restaurant_longitude: number;
}
