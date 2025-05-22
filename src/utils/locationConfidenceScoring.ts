
import { NetworkType } from '@/types/unifiedLocation';
import { LocationSource, UnifiedLocation } from '@/types/unifiedLocation';

// Scoring weights for different factors
const SOURCE_WEIGHTS: Record<LocationSource, number> = {
  'gps': 10,
  'wifi': 7,
  'cell': 5,
  'manual': 3,
  'ip': 2,
  'cached': 1,
  'fusion': 6,
  'unknown': 0
};

const ACCURACY_THRESHOLDS = {
  excellent: 10, // meters or less
  good: 50,
  fair: 100,
  poor: 500
};

const RECENCY_THRESHOLDS = {
  excellent: 60000, // 1 minute or less
  good: 300000,     // 5 minutes
  fair: 900000,     // 15 minutes
  poor: 3600000     // 1 hour
};

const NETWORK_WEIGHTS: Record<NetworkType, number> = {
  'wifi': 10,
  'ethernet': 10,
  'cellular_5g': 9,
  'cellular_4g': 7,
  'cellular_3g': 5,
  'cellular_2g': 3,
  'unknown': 2,
  'none': 0
};

export type ConfidenceCategory = 'high' | 'medium' | 'low' | 'very-low' | 'unknown';

export interface ConfidenceScore {
  overall: number; // 0-100
  factors: {
    source: number;
    accuracy: number;
    recency: number;
    network: number;
    movement: number;
  };
  rating: 'high' | 'medium' | 'low' | 'unknown';
}

/**
 * Calculate a confidence score for a location
 * Higher score = more confidence in the location's accuracy and relevance
 */
export function calculateLocationConfidence(location: UnifiedLocation): ConfidenceScore {
  // Start with base factors
  const sourceScore = SOURCE_WEIGHTS[location.source] || 0;
  
  // Accuracy score (higher accuracy = lower number = better score)
  let accuracyScore = 0;
  if (location.accuracy) {
    if (location.accuracy <= ACCURACY_THRESHOLDS.excellent) {
      accuracyScore = 10;
    } else if (location.accuracy <= ACCURACY_THRESHOLDS.good) {
      accuracyScore = 7;
    } else if (location.accuracy <= ACCURACY_THRESHOLDS.fair) {
      accuracyScore = 4;
    } else if (location.accuracy <= ACCURACY_THRESHOLDS.poor) {
      accuracyScore = 2;
    } else {
      accuracyScore = 1;
    }
  }
  
  // Recency score
  let recencyScore = 0;
  const timestamp = new Date(location.timestamp).getTime();
  const age = Date.now() - timestamp;
  
  if (age <= RECENCY_THRESHOLDS.excellent) {
    recencyScore = 10;
  } else if (age <= RECENCY_THRESHOLDS.good) {
    recencyScore = 7;
  } else if (age <= RECENCY_THRESHOLDS.fair) {
    recencyScore = 4;
  } else if (age <= RECENCY_THRESHOLDS.poor) {
    recencyScore = 2;
  } else {
    recencyScore = 0;
  }
  
  // Network factor
  const networkScore = location.networkInfo?.connected 
    ? (NETWORK_WEIGHTS[location.networkInfo.type] || 0) 
    : 0;
  
  // Movement factor - additional confidence if we have movement data
  const movementScore = location.speed !== undefined || location.isMoving !== undefined ? 5 : 0;
  
  // Calculate overall score (0-100)
  const factors = {
    source: sourceScore,
    accuracy: accuracyScore,
    recency: recencyScore,
    network: networkScore,
    movement: movementScore
  };
  
  const weights = {
    source: 0.3,
    accuracy: 0.3,
    recency: 0.2,
    network: 0.1,
    movement: 0.1
  };
  
  const overall = Math.min(100, Math.round(
    factors.source * weights.source * 10 +
    factors.accuracy * weights.accuracy * 10 +
    factors.recency * weights.recency * 10 +
    factors.network * weights.network * 10 +
    factors.movement * weights.movement * 10
  ));
  
  // Determine rating
  let rating: 'high' | 'medium' | 'low' | 'unknown';
  if (overall >= 75) {
    rating = 'high';
  } else if (overall >= 40) {
    rating = 'medium';
  } else if (overall > 0) {
    rating = 'low';
  } else {
    rating = 'unknown';
  }
  
  return {
    overall,
    factors,
    rating
  };
}

/**
 * Get a simplified confidence category
 */
export function getConfidenceCategory(score: ConfidenceScore): ConfidenceCategory {
  if (score.overall >= 75) {
    return 'high';
  } else if (score.overall >= 50) {
    return 'medium';
  } else if (score.overall >= 25) {
    return 'low';
  } else if (score.overall > 0) {
    return 'very-low';
  } else {
    return 'unknown';
  }
}

/**
 * Get a human-readable description of location quality
 */
export function getLocationQualityDescription(location: UnifiedLocation): string {
  const score = calculateLocationConfidence(location);
  const category = getConfidenceCategory(score);
  
  switch (category) {
    case 'high':
      return `High quality location from ${location.source} source with ${location.accuracy}m accuracy.`;
    case 'medium':
      return `Decent location accuracy from ${location.source} source.`;
    case 'low':
      return `Limited location reliability from ${location.source} source.`;
    case 'very-low':
      return `Poor location accuracy. Consider refreshing or using a different source.`;
    case 'unknown':
    default:
      return 'Unable to determine location quality.';
  }
}
