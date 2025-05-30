
import { UnifiedLocation, LocationSource } from '@/types/unifiedLocation';
import { LocationFreshness } from '@/types/unifiedLocation';

interface LocationQualityScore {
  accuracy: number;
  recency: number;
  source: number;
  overall: number;
}

export class LocationSourceFusion {
  private readonly sourceWeights = {
    gps: 1.0,
    fused: 0.9,
    network: 0.6,
    passive: 0.4,
    unknown: 0.2
  };

  calculateQualityScore(location: UnifiedLocation): LocationQualityScore {
    const now = Date.now();
    const ageMs = now - location.timestamp;
    
    // Calculate accuracy score (inverse of accuracy - lower accuracy value = higher score)
    const accuracyScore = location.accuracy ? Math.min(1, 100 / location.accuracy) : 0.5;
    
    // Calculate recency score (fresher = higher score)
    const maxAgeMs = 5 * 60 * 1000; // 5 minutes
    const recencyScore = Math.max(0, 1 - (ageMs / maxAgeMs));
    
    // Calculate source score
    const sourceScore = this.sourceWeights[location.source || 'unknown'];
    
    // Calculate overall score
    const overall = (accuracyScore * 0.4) + (recencyScore * 0.3) + (sourceScore * 0.3);
    
    return {
      accuracy: accuracyScore,
      recency: recencyScore,
      source: sourceScore,
      overall
    };
  }

  selectBestLocation(locations: UnifiedLocation[]): UnifiedLocation | null {
    if (locations.length === 0) return null;
    if (locations.length === 1) return locations[0];

    let bestLocation = locations[0];
    let bestScore = this.calculateQualityScore(bestLocation).overall;

    for (let i = 1; i < locations.length; i++) {
      const location = locations[i];
      const score = this.calculateQualityScore(location).overall;
      
      if (score > bestScore) {
        bestLocation = location;
        bestScore = score;
      }
    }

    return bestLocation;
  }

  fuseLocations(locations: UnifiedLocation[]): UnifiedLocation | null {
    if (locations.length === 0) return null;
    if (locations.length === 1) return locations[0];

    // Weight locations by their quality scores
    const weightedLocations = locations.map(location => ({
      location,
      weight: this.calculateQualityScore(location).overall
    }));

    const totalWeight = weightedLocations.reduce((sum, item) => sum + item.weight, 0);
    
    if (totalWeight === 0) return locations[0];

    // Calculate weighted average position
    let weightedLat = 0;
    let weightedLng = 0;
    let weightedAccuracy = 0;
    let latestTimestamp = 0;
    let bestSource: LocationSource = 'unknown';
    let bestSourceWeight = 0;

    weightedLocations.forEach(({ location, weight }) => {
      const normalizedWeight = weight / totalWeight;
      
      weightedLat += location.latitude * normalizedWeight;
      weightedLng += location.longitude * normalizedWeight;
      
      if (location.accuracy) {
        weightedAccuracy += location.accuracy * normalizedWeight;
      }
      
      if (location.timestamp > latestTimestamp) {
        latestTimestamp = location.timestamp;
      }
      
      if (weight > bestSourceWeight && location.source) {
        bestSource = location.source;
        bestSourceWeight = weight;
      }
    });

    return {
      latitude: weightedLat,
      longitude: weightedLng,
      accuracy: weightedAccuracy || undefined,
      timestamp: latestTimestamp,
      source: bestSource,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      isMoving: false
    };
  }

  calculateFreshness(timestamp: number): LocationFreshness {
    const now = Date.now();
    const ageMs = now - timestamp;
    const ageMinutes = ageMs / (1000 * 60);
    
    if (ageMinutes <= 1) return 'fresh';
    if (ageMinutes <= 5) return 'stale';
    if (ageMinutes <= 30) return 'expired';
    return 'invalid';
  }

  isLocationSignificantlyDifferent(loc1: UnifiedLocation, loc2: UnifiedLocation, threshold = 10): boolean {
    // Calculate distance in meters using Haversine formula (simplified)
    const R = 6371000; // Earth's radius in meters
    const lat1Rad = (loc1.latitude * Math.PI) / 180;
    const lat2Rad = (loc2.latitude * Math.PI) / 180;
    const deltaLatRad = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
    const deltaLngRad = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance > threshold;
  }
}

export const locationFusion = new LocationSourceFusion();
