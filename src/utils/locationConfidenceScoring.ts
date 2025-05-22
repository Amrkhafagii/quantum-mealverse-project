
import { LocationSource, UnifiedLocation, NetworkType } from '@/types/unifiedLocation';

/**
 * Confidence scores for different location sources (out of 100)
 */
export const SOURCE_CONFIDENCE: Record<LocationSource, number> = {
  'gps': 90,
  'wifi': 70,
  'network': 60,
  'cell_tower': 50,
  'ip_address': 30,
  'manual': 40,
  'cached': 20,
  'fused': 80,
  'unknown': 10
};

/**
 * Network quality impacts on location confidence
 */
export const NETWORK_CONFIDENCE_MODIFIER: Record<NetworkType, number> = {
  'wifi': 0,         // No reduction
  'cellular_5g': 0,  // No reduction
  'cellular_4g': -5, 
  'cellular_3g': -10,
  'cellular_2g': -20,
  'unknown': -15,
  'none': -30,       // Large reduction if no network
  'ethernet': 0      // No reduction for ethernet
};

/**
 * Accuracy thresholds for confidence scoring
 */
export const ACCURACY_THRESHOLDS = {
  EXCELLENT: 10,   // Less than 10 meters
  GOOD: 50,        // Less than 50 meters
  MODERATE: 100,   // Less than 100 meters
  POOR: 500,       // Less than 500 meters
  VERY_POOR: 1000  // Less than 1km
};

/**
 * Calculate confidence score for a location based on multiple factors
 * 
 * @param location The location to score
 * @returns A score between 0-100 representing confidence
 */
export const calculateLocationConfidence = (location: UnifiedLocation): number => {
  // Start with base confidence from location source
  let score = SOURCE_CONFIDENCE[location.source || 'unknown'] || 50;
  
  // Factor in accuracy if available
  if (location.accuracy !== undefined && location.accuracy !== null) {
    if (location.accuracy <= ACCURACY_THRESHOLDS.EXCELLENT) {
      score += 10;
    } else if (location.accuracy <= ACCURACY_THRESHOLDS.GOOD) {
      score += 5;
    } else if (location.accuracy <= ACCURACY_THRESHOLDS.MODERATE) {
      // No change
    } else if (location.accuracy <= ACCURACY_THRESHOLDS.POOR) {
      score -= 10;
    } else if (location.accuracy <= ACCURACY_THRESHOLDS.VERY_POOR) {
      score -= 20;
    } else {
      score -= 30; // Very inaccurate
    }
  }
  
  // Factor in network quality
  if (location.network_type) {
    score += NETWORK_CONFIDENCE_MODIFIER[location.network_type] || 0;
  }
  
  // Factor in freshness (if timestamp is older than 5 minutes, reduce confidence)
  const timestamp = typeof location.timestamp === 'string' 
    ? new Date(location.timestamp).getTime() 
    : (typeof location.timestamp === 'number' ? location.timestamp : Date.now());
    
  const ageInMinutes = (Date.now() - timestamp) / (1000 * 60);
  if (ageInMinutes > 30) {
    score -= 50;
  } else if (ageInMinutes > 15) {
    score -= 30;
  } else if (ageInMinutes > 5) {
    score -= 15;
  } else if (ageInMinutes > 1) {
    score -= 5;
  }
  
  // Limit the score to 0-100 range
  return Math.max(0, Math.min(100, Math.round(score)));
};

/**
 * Get a confidence category based on the numeric score
 */
export const getConfidenceCategory = (score: number): 'high' | 'medium' | 'low' | 'very-low' => {
  if (score >= 75) return 'high';
  if (score >= 50) return 'medium';
  if (score >= 25) return 'low';
  return 'very-low';
};

/**
 * Generate human-readable description of location quality
 */
export const getLocationQualityDescription = (location: UnifiedLocation): string => {
  const score = calculateLocationConfidence(location);
  const category = getConfidenceCategory(score);
  
  switch (category) {
    case 'high':
      return `High confidence (${score}%) - ${location.source || 'unknown'} location with ${location.accuracy || 'unknown'} meter accuracy`;
    case 'medium':
      return `Medium confidence (${score}%) - ${location.source || 'unknown'} location with ${location.accuracy || 'unknown'} meter accuracy`;
    case 'low':
      return `Low confidence (${score}%) - Consider refreshing location`;
    case 'very-low':
      return `Very low confidence (${score}%) - Location may be inaccurate`;
    default:
      return `Unknown confidence (${score}%)`;
  }
};
