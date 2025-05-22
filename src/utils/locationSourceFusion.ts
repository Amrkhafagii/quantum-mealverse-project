import { UnifiedLocation } from '@/types/unifiedLocation';
import { calculateLocationConfidence } from './locationConfidenceScoring';

/**
 * Combine multiple location sources into a single optimal location.
 * This uses a weighted average based on confidence scores.
 *
 * @param locations Array of location readings from different sources
 * @returns The fused location or null if no valid locations
 */
export const fuseLocationSources = (locations: UnifiedLocation[]): UnifiedLocation | null => {
  if (!locations.length) return null;
  
  // If there's only one location, return it directly
  if (locations.length === 1) return locations[0];
  
  // Calculate confidence scores for all locations
  const locationsWithConfidence = locations.map(location => ({
    location,
    confidence: calculateLocationConfidence(location)
  }));
  
  // Get the highest confidence location as our primary source
  const bestLocation = locationsWithConfidence.reduce((prev, current) => 
    current.confidence > prev.confidence ? current : prev, 
    locationsWithConfidence[0]
  );
  
  // If the best location has high confidence (>80), just use it directly
  if (bestLocation.confidence > 80) {
    return bestLocation.location;
  }
  
  // Otherwise, do a weighted average of coordinates based on confidence
  const totalConfidence = locationsWithConfidence.reduce((sum, item) => sum + item.confidence, 0);
  
  if (totalConfidence === 0) {
    // If all locations have 0 confidence, just return the most recent
    const mostRecent = locations.reduce((latest, location) => 
      new Date(location.timestamp) > new Date(latest.timestamp) ? location : latest, 
      locations[0]
    );
    return mostRecent;
  }
  
  // Calculate weighted coordinates
  let weightedLat = 0;
  let weightedLng = 0;
  let highestAccuracy = Number.MAX_VALUE;
  
  locationsWithConfidence.forEach(({ location, confidence }) => {
    const weight = confidence / totalConfidence;
    weightedLat += location.latitude * weight;
    weightedLng += location.longitude * weight;
    
    // Keep track of the best accuracy
    if (location.accuracy !== undefined && location.accuracy < highestAccuracy) {
      highestAccuracy = location.accuracy;
    }
  });
  
  // Create the fused location, inheriting most properties from the best location
  // but using the weighted average coordinates
  return {
    ...bestLocation.location,
    latitude: weightedLat,
    longitude: weightedLng,
    // Adjust accuracy to be a bit worse than the best individual reading
    // since we're making assumptions in our fusion
    accuracy: highestAccuracy !== Number.MAX_VALUE 
      ? Math.round(highestAccuracy * 1.2) 
      : bestLocation.location.accuracy,
    // Mark that this is a fused result
    source: 'fused' as any, // This is technically not in our type, but useful for debugging
    timestamp: new Date().toISOString()
  };
};

/**
 * Get the optimal location based on the context of what the location will be used for
 * 
 * @param locations Available location sources
 * @param purpose Purpose of the location request (affects prioritization)
 */
export const getOptimalLocation = (
  locations: UnifiedLocation[],
  purpose: 'navigation' | 'tracking' | 'geofencing' | 'general' = 'general'
): UnifiedLocation | null => {
  if (!locations.length) return null;
  
  switch (purpose) {
    case 'navigation':
      // For navigation, prioritize accuracy over age
      return fuseLocationSources(
        // Sort by recency first, then filter for reasonable accuracy
        locations
          .filter(l => !l.accuracy || l.accuracy < 200)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      );
      
    case 'tracking':
      // For tracking, we want the most recent location, even if less accurate
      return locations.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];
      
    case 'geofencing':
      // For geofencing, we need good accuracy
      return fuseLocationSources(
        locations.filter(l => !l.accuracy || l.accuracy < 100)
      );
      
    case 'general':
    default:
      // For general purpose, use fusion of all available sources
      return fuseLocationSources(locations);
  }
};
