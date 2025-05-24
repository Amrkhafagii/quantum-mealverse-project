
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp: number;
}

export interface LocationError {
  code: number;
  message: string;
}

export interface ILocationService {
  getCurrentLocation(): Promise<LocationData>;
  startWatching(callback: (location: LocationData) => void, errorCallback?: (error: LocationError) => void): Promise<void>;
  stopWatching(): Promise<void>;
  getLastKnownLocation(): Promise<LocationData | null>;
  setOptions?(options: any): void;
}
