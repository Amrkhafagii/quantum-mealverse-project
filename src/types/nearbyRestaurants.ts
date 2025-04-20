
export interface NearbyRestaurantLocation {
  restaurant_latitude: number;
  restaurant_longitude: number;
}

export interface NearbyRestaurantsRow {
  id: string;
  user_id: string;
  user_latitude: number;
  user_longitude: number;
  nearby: NearbyRestaurantLocation[];
  created_at: string;
}
