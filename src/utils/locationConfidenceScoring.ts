
import { UnifiedLocation, ConfidenceScore, LocationSource } from '@/types/unifiedLocation';

// Source confidence scores (0-100)
const SOURCE_CONFIDENCE: Record<LocationSource, number> = {
  'gps': 90,
  'network': 70,
  'passive': 50,
  'manual': 80,
  'cached': 40,
  'unknown': 30,
  'wifi': 80
};

// Function to calculate confidence score for a location
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
  
  // Calculate accuracy score (0-100)
  const accuracyScore = calculateAccuracyScore(location.accuracy);
  
  // Calculate recency score (0-100)
  const recencyScore = calculateRecencyScore(location.timestamp);
  
  // Calculate source score (0-100)
  const sourceScore = calculateSourceScore(location.source);
  
  // Calculate network score (0-100)
  const networkScore = 70; // Default medium confidence
  
  // Calculate overall score (weighted average)
  const overall = Math.round(
    accuracyScore * 0.4 +
    recencyScore * 0.3 +
    sourceScore * 0.2 +
    networkScore * 0.1
  );
  
  return {
    overall,
    accuracy: accuracyScore,
    recency: recencyScore,
    source: sourceScore,
    network: networkScore
  };
}

// Calculate accuracy score based on accuracy in meters
function calculateAccuracyScore(accuracy: number | undefined): number {
  if (accuracy === undefined) return 0;
  
  // Higher accuracy (lower number) should result in higher score
  if (accuracy < 10) return 100;   // Extremely accurate
  if (accuracy < 25) return 90;    // Very accurate
  if (accuracy < 50) return 80;    // Accurate
  if (accuracy < 100) return 70;   // Moderately accurate
  if (accuracy < 500) return 50;   // Somewhat accurate
  if (accuracy < 1000) return 30;  // Not very accurate
  
  return 10; // Poor accuracy
}

// Calculate recency score based on timestamp
function calculateRecencyScore(timestamp: number): number {
  const now = Date.now();
  const ageInSeconds = (now - timestamp) / 1000;
  
  // More recent locations should have higher scores
  if (ageInSeconds < 10) return 100;    // Almost real-time
  if (ageInSeconds < 30) return 95;     // Very recent
  if (ageInSeconds < 60) return 90;     // Less than a minute old
  if (ageInSeconds < 300) return 80;    // Less than 5 minutes old
  if (ageInSeconds < 600) return 70;    // Less than 10 minutes old
  if (ageInSeconds < 1800) return 50;   // Less than 30 minutes old
  if (ageInSeconds < 3600) return 30;   // Less than an hour old
  if (ageInSeconds < 7200) return 20;   // Less than 2 hours old
  
  return 10; // Old data
}

// Calculate source score based on the source of the location data
function calculateSourceScore(source: LocationSource | undefined): number {
  if (!source) return SOURCE_CONFIDENCE.unknown;
  return SOURCE_CONFIDENCE[source] || 30; // Default to low confidence if source is unknown
}

// Get confidence category based on score
export function getConfidenceCategory(score: number): 'high' | 'medium' | 'low' | 'very-low' | 'unknown' {
  if (score >= 80) return 'high';
  if (score >= 60) return 'medium';
  if (score >= 40) return 'low';
  if (score >= 20) return 'very-low';
  return 'unknown';
}

// Get a readable description of location quality
export function getLocationQualityDescription(location: UnifiedLocation): string {
  const confidence = calculateLocationConfidence(location);
  const confidenceCategory = getConfidenceCategory(confidence.overall);
  
  switch (confidenceCategory) {
    case 'high':
      return 'High-confidence location';
    case 'medium':
      return 'Medium-confidence location';
    case 'low':
      return 'Low-confidence location';
    case 'very-low':
      return 'Very low confidence location';
    case 'unknown':
    default:
      return 'Unknown location quality';
  }
}

// Check if location is fresh enough for the given use case
export function isLocationFresh(location: UnifiedLocation, maxAgeSeconds = 300): boolean {
  if (!location || !location.timestamp) return false;
  
  const now = Date.now();
  const ageInSeconds = (now - location.timestamp) / 1000;
  
  return ageInSeconds <= maxAgeSeconds;
}
