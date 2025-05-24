
import { UnifiedLocation, ConfidenceScore, LocationSource, NetworkType } from '@/types/unifiedLocation';

// Source confidence scores (0-100)
const SOURCE_CONFIDENCE: Record<LocationSource, number> = {
  'gps': 90,
  'network': 60,
  'wifi': 70,
  'passive': 40,
  'manual': 50,
  'cached': 30,
  'unknown': 10
};

// Calculate confidence score based on multiple factors
export function calculateLocationConfidence(location: UnifiedLocation): ConfidenceScore {
  if (!location) {
    return {
      overall: 0,
      accuracy: 0,
      recency: 0,
      source: 0,
      network: 0
    };
  }
  
  // Calculate accuracy confidence (0-100)
  const accuracyScore = calculateAccuracyConfidence(location.accuracy);
  
  // Calculate recency confidence (0-100)
  const recencyScore = calculateRecencyConfidence(location.timestamp);
  
  // Calculate source confidence (0-100)
  const sourceScore = calculateSourceConfidence(location.source);
  
  // Calculate network quality confidence (0-100)
  const networkScore = calculateNetworkConfidence(location);
  
  // Overall confidence is weighted average
  const overall = Math.round(
    (accuracyScore * 0.35) + 
    (recencyScore * 0.30) + 
    (sourceScore * 0.25) + 
    (networkScore * 0.10)
  );
  
  return {
    overall: Math.min(100, Math.max(0, overall)),
    accuracy: accuracyScore,
    recency: recencyScore,
    source: sourceScore,
    network: networkScore
  };
}

// Calculate confidence based on accuracy
function calculateAccuracyConfidence(accuracy?: number): number {
  if (accuracy === undefined) return 0;
  
  if (accuracy < 10) return 100;
  if (accuracy < 50) return 80;
  if (accuracy < 100) return 60;
  if (accuracy < 500) return 40;
  if (accuracy < 1000) return 20;
  return 10;
}

// Calculate confidence based on timestamp recency
function calculateRecencyConfidence(timestamp: number): number {
  const ageInSeconds = (Date.now() - timestamp) / 1000;
  
  if (ageInSeconds < 5) return 100;
  if (ageInSeconds < 30) return 90;
  if (ageInSeconds < 60) return 80;
  if (ageInSeconds < 300) return 60;
  if (ageInSeconds < 900) return 40;
  if (ageInSeconds < 3600) return 20;
  return 10;
}

// Calculate confidence based on location source
function calculateSourceConfidence(source?: LocationSource): number {
  if (!source || !(source in SOURCE_CONFIDENCE)) return 10;
  return SOURCE_CONFIDENCE[source];
}

// Calculate confidence based on network status
function calculateNetworkConfidence(location: UnifiedLocation): number {
  // Default confidence if no network info
  if (!location.networkInfo) return 50;
  
  // Base score on connection status
  let score = location.networkInfo.connected ? 80 : 30;
  
  // Adjust based on connection type
  if (location.networkInfo && location.networkInfo.type) {
    switch (location.networkInfo.type) {
      case '5g': 
        score += 20;
        break;
      case '4g':
      case 'wifi':
        score += 15;
        break;
      case '3g':
        score += 5;
        break;
      case '2g':
        score -= 10;
        break;
      case 'none':
        score = 10;
        break;
      default:
        // No adjustment
        break;
    }
  }
  
  return Math.min(100, Math.max(0, score));
}

// Get confidence category based on score
export function getConfidenceCategory(score: number): 'high' | 'medium' | 'low' | 'very-low' | 'unknown' {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  if (score >= 40) return 'low';
  if (score >= 10) return 'very-low';
  return 'unknown';
}

// Get human-readable location quality description
export function getLocationQualityDescription(location: UnifiedLocation): string {
  const confidence = calculateLocationConfidence(location);
  const category = getConfidenceCategory(confidence.overall);
  
  switch (category) {
    case 'high':
      return 'High accuracy location';
    case 'medium':
      return 'Moderate accuracy location';
    case 'low':
      return 'Low accuracy location';
    case 'very-low':
      return 'Very low accuracy location';
    case 'unknown':
    default:
      return 'Unknown location quality';
  }
}
