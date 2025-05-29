
/**
 * Geocoding utility to convert addresses to coordinates
 */

interface GeocodeResult {
  latitude: number;
  longitude: number;
}

/**
 * Geocode an address to get latitude and longitude coordinates
 * Uses a fallback to default coordinates if geocoding fails
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  // Default fallback coordinates (Toronto, Canada)
  const fallbackCoordinates = {
    latitude: 43.6532,
    longitude: -79.3832
  };

  try {
    // Try to use browser's geolocation API or a geocoding service
    // For now, we'll use a simple approach with OpenStreetMap Nominatim API
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`
    );
    
    if (!response.ok) {
      console.warn('Geocoding API request failed, using fallback coordinates');
      return fallbackCoordinates;
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }
    
    console.warn('No geocoding results found, using fallback coordinates');
    return fallbackCoordinates;
  } catch (error) {
    console.warn('Geocoding failed, using fallback coordinates:', error);
    return fallbackCoordinates;
  }
}
