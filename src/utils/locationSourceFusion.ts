
import { UnifiedLocation } from '@/types/unifiedLocation';
import { calculateLocationConfidence, ConfidenceScore } from './locationConfidenceScoring';

/**
 * Fuse multiple location sources into one most accurate location
 * Uses confidence scores to determine the best location
 */
export function fuseLocations(locations: UnifiedLocation[]): UnifiedLocation | null {
  if (!locations || locations.length === 0) {
    return null;
  }
  
  if (locations.length === 1) {
    return locations[0];
  }
  
  // Calculate confidence scores for each location
  const locationsWithScores = locations.map(location => ({
    location,
    score: calculateLocationConfidence(location)
  }));
  
  // Sort by overall confidence score (highest first)
  locationsWithScores.sort((a, b) => b.score.overall - a.score.overall);
  
  // If the best location is significantly better than others, use it directly
  if (locationsWithScores.length > 1 && 
      locationsWithScores[0].score.overall > (locationsWithScores[1].score.overall + 20)) {
    return locationsWithScores[0].location;
  }
  
  // Otherwise, fuse the top locations
  const topLocations = locationsWithScores.filter(
    item => item.score.overall >= (locationsWithScores[0].score.overall - 20)
  );
  
  // Calculate weighted average for coordinates
  let totalWeight = 0;
  let weightedLat = 0;
  let weightedLng = 0;
  let bestAccuracy = Number.MAX_VALUE;
  let mostRecentTimestamp = 0;
  
  for (const { location, score } of topLocations) {
    const weight = score.overall;
    totalWeight += weight;
    
    weightedLat += location.latitude * weight;
    weightedLng += location.longitude * weight;
    
    // Keep the best accuracy
    if (location.accuracy && location.accuracy < bestAccuracy) {
      bestAccuracy = location.accuracy;
    }
    
    // Keep the most recent timestamp
    const timestamp = new Date(location.timestamp).getTime();
    if (timestamp > mostRecentTimestamp) {
      mostRecentTimestamp = timestamp;
    }
  }
  
  // Create the fused location
  const fusedLocation: UnifiedLocation = {
    latitude: weightedLat / totalWeight,
    longitude: weightedLng / totalWeight,
    accuracy: bestAccuracy !== Number.MAX_VALUE ? bestAccuracy : undefined,
    timestamp: new Date(mostRecentTimestamp).toISOString(),
    source: 'fusion',
  };
  
  return fusedLocation;
}

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
      return fuseLocations(
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
      return fuseLocations(
        locations.filter(l => !l.accuracy || l.accuracy < 100)
      );
      
    case 'general':
    default:
      // For general purpose, use fusion of all available sources
      return fuseLocations(locations);
  }
};
