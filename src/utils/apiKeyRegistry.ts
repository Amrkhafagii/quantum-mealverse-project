
/**
 * API Key Registry
 * 
 * This file contains information about all API keys used in the application.
 * It serves as documentation for developers and can be used to generate 
 * API key management UI dynamically.
 */

export interface ApiKeyInfo {
  id: string;
  name: string;
  description: string;
  configKey: string;
  localStorageKey: string;
  envVarKey: string;
  docUrl: string;
  isRequired: boolean;
  validationUrl?: string;
}

export const API_KEYS: ApiKeyInfo[] = [
  {
    id: 'google_maps',
    name: 'Google Maps API Key',
    description: 'Required for maps, geocoding, and routing functionality.',
    configKey: 'google_maps_api_key',
    localStorageKey: 'googleMapsApiKey',
    envVarKey: 'VITE_GOOGLE_MAPS_API_KEY',
    docUrl: 'https://developers.google.com/maps/documentation/javascript/get-api-key',
    isRequired: true,
    validationUrl: 'https://maps.googleapis.com/maps/api/geocode/json?address=test&key={key}'
  }
];

/**
 * Get API key info by ID
 */
export function getApiKeyInfo(id: string): ApiKeyInfo | undefined {
  return API_KEYS.find(key => key.id === id);
}

/**
 * Check if an API key is required but missing
 */
export async function checkMissingRequiredKeys(): Promise<string[]> {
  const missingKeys: string[] = [];
  
  // Implementation would check if required keys are missing
  // This is a placeholder for future implementation
  
  return missingKeys;
}

/**
 * Get all registered API keys
 */
export function getAllApiKeys(): ApiKeyInfo[] {
  return [...API_KEYS];
}
