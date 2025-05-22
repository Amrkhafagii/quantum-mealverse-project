import { NetworkQuality, NetworkType } from '@/types/unifiedLocation';
import { Platform } from './platform';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { useState, useEffect, useCallback } from 'react';

/**
 * Calculate estimated download time for a file based on network bandwidth
 * @param fileSizeBytes Size of the file in bytes
 * @param bandwidthKbps Bandwidth in Kbps
 * @returns Estimated download time in seconds
 */
export const calculateDownloadTime = (
  fileSizeBytes: number,
  bandwidthKbps: number
): number => {
  if (!bandwidthKbps || bandwidthKbps <= 0) return Infinity;
  
  // Convert file size to kilobits (1 byte = 8 bits)
  const fileSizeKb = (fileSizeBytes * 8) / 1000;
  
  // Calculate time in seconds
  return fileSizeKb / bandwidthKbps;
};

/**
 * Determine if a resource should be preloaded based on network conditions
 * @param resourceSizeBytes Size of the resource in bytes
 * @param networkType Current network type
 * @param networkQuality Current network quality
 * @returns Boolean indicating if resource should be preloaded
 */
export const shouldPreloadResource = (
  resourceSizeBytes: number,
  networkType: NetworkType,
  networkQuality: NetworkQuality
): boolean => {
  // Don't preload on poor connections
  if (networkQuality === 'poor' || networkQuality === 'very-poor') {
    return false;
  }
  
  // Always preload small resources
  if (resourceSizeBytes < 50000) { // Less than 50KB
    return true;
  }
  
  // For medium resources, check network type
  if (resourceSizeBytes < 500000) { // Less than 500KB
    return networkType === 'wifi' || 
           networkType === 'ethernet' || 
           networkType === 'cellular_5g' || 
           networkType === 'cellular_4g';
  }
  
  // For large resources, only preload on fast connections
  return (networkType === 'wifi' || networkType === 'ethernet') && 
         (networkQuality === 'excellent' || networkQuality === 'good');
};

/**
 * Get appropriate image quality based on network conditions
 * @param networkType Current network type
 * @param networkQuality Current network quality
 * @returns Image quality string ('low', 'medium', 'high', 'original')
 */
export const getAdaptiveImageQuality = (
  networkType: NetworkType,
  networkQuality: NetworkQuality
): 'low' | 'medium' | 'high' | 'original' => {
  // Poor connection - use low quality
  if (networkQuality === 'poor' || networkQuality === 'very-poor') {
    return 'low';
  }
  
  // Cellular connections with fair quality - use medium
  if ((networkType.includes('cellular') && networkType !== 'cellular_5g') && 
      networkQuality === 'fair') {
    return 'medium';
  }
  
  // Good connections - use high quality
  if ((networkType === 'wifi' || networkType === 'ethernet' || networkType === 'cellular_5g') && 
      (networkQuality === 'good' || networkQuality === 'excellent')) {
    return 'original';
  }
  
  // Default to high quality
  return 'high';
};

/**
 * Determine if video should autoplay based on network conditions
 * @param videoSizeBytes Estimated video size in bytes
 * @param durationSeconds Video duration in seconds
 * @param networkType Current network type
 * @param networkQuality Current network quality
 * @returns Boolean indicating if video should autoplay
 */
export const shouldAutoplayVideo = (
  videoSizeBytes: number,
  durationSeconds: number,
  networkType: NetworkType,
  networkQuality: NetworkQuality
): boolean => {
  // Never autoplay on poor connections
  if (networkQuality === 'poor' || networkQuality === 'very-poor') {
    return false;
  }
  
  // Calculate bitrate (bytes per second)
  const bitrateBytes = videoSizeBytes / durationSeconds;
  
  // Low bitrate videos can autoplay on most connections
  if (bitrateBytes < 100000) { // Less than ~800Kbps
    return true;
  }
  
  // Medium bitrate videos only on good connections
  if (bitrateBytes < 300000) { // Less than ~2.4Mbps
    return (networkType === 'wifi' || networkType === 'ethernet' || networkType === 'cellular_5g') && 
           (networkQuality === 'good' || networkQuality === 'excellent');
  }
  
  // High bitrate videos only on excellent wifi/ethernet
  return (networkType === 'wifi' || networkType === 'ethernet') && 
         networkQuality === 'excellent';
};

/**
 * Get appropriate video quality based on network conditions
 * @param networkType Current network type
 * @param networkQuality Current network quality
 * @returns Video quality string ('240p', '360p', '480p', '720p', '1080p', '4k')
 */
export const getAdaptiveVideoQuality = (
  networkType: NetworkType,
  networkQuality: NetworkQuality
): '240p' | '360p' | '480p' | '720p' | '1080p' | '4k' => {
  // Poor connection - lowest quality
  if (networkQuality === 'poor' || networkQuality === 'very-poor') {
    return '240p';
  }
  
  // Fair connection on cellular - low quality
  if (networkType.includes('cellular') && networkType !== 'cellular_5g' && 
      networkQuality === 'fair') {
    return '360p';
  }
  
  // Good cellular or fair wifi - medium quality
  if ((networkType.includes('cellular') && networkQuality === 'good') || 
      ((networkType === 'wifi' || networkType === 'ethernet') && networkQuality === 'fair')) {
    return '480p';
  }
  
  // Excellent cellular or good wifi - high quality
  if ((networkType.includes('cellular') && networkQuality === 'excellent') || 
      ((networkType === 'wifi' || networkType === 'ethernet') && networkQuality === 'good')) {
    return '720p';
  }
  
  // Excellent wifi/ethernet - highest quality
  if ((networkType === 'wifi' || networkType === 'ethernet') && networkQuality === 'excellent') {
    return '1080p';
  }
  
  // Default to 480p
  return '480p';
};

/**
 * Calculate adaptive fetch timeout based on network conditions
 * @param baseTimeoutMs Base timeout in milliseconds
 * @param networkType Current network type
 * @param networkQuality Current network quality
 * @returns Adjusted timeout in milliseconds
 */
export const getAdaptiveFetchTimeout = (
  baseTimeoutMs: number,
  networkType: NetworkType,
  networkQuality: NetworkQuality
): number => {
  let multiplier = 1;
  
  // Adjust based on network quality
  switch (networkQuality) {
    case 'excellent':
      multiplier = 0.8;
      break;
    case 'good':
      multiplier = 1;
      break;
    case 'fair':
      multiplier = 1.5;
      break;
    case 'poor':
      multiplier = 2;
      break;
    case 'very-poor':
      multiplier = 3;
      break;
    default:
      multiplier = 1.5;
  }
  
  // Further adjust based on network type
  if (networkType === 'none') {
    multiplier *= 3;
  } else if (networkType.includes('cellular') && networkType !== 'cellular_5g') {
    multiplier *= 1.5;
  }
  
  return Math.round(baseTimeoutMs * multiplier);
};

/**
 * Determine if a resource should be lazy loaded based on network and device
 * @param resourceSizeBytes Size of the resource in bytes
 * @param network Current network information
 * @returns Boolean indicating if resource should be lazy loaded
 */
export const shouldLazyLoad = (
  resourceSizeBytes: number,
  network: {
    type: NetworkType;
    connected: boolean;
    bandwidth?: number;
  }
): boolean => {
  // Always lazy load large resources
  if (resourceSizeBytes > 1000000) { // > 1MB
    return true;
  }
  
  // Don't lazy load small resources on good connections
  if (resourceSizeBytes < 100000 && // < 100KB
      (network.type === 'wifi' || network.type === 'ethernet') && 
      network.connected) {
    return false;
  }
  
  // Check if we have bandwidth information
  if (network.bandwidth !== undefined) {
    const estimatedDownloadTime = calculateDownloadTime(resourceSizeBytes, network.bandwidth);
    
    // If download would be quick, don't lazy load
    if (estimatedDownloadTime < 0.5) { // Less than 0.5 seconds
      return false;
    }
  }
  
  // Consider device type
  const isMobile = Platform.isMobile();
  const isLowPowerDevice = isMobile && !Platform.isHighEndDevice();
  
  // Lazy load more aggressively on low-power mobile devices
  if (isLowPowerDevice) {
    return resourceSizeBytes > 50000; // > 50KB
  }
  
  // Default behavior - lazy load medium and large resources
  return resourceSizeBytes > 200000; // > 200KB
};

/**
 * Determine if high-end features should be enabled based on device and network
 * @param networkType Current network type
 * @param networkQuality Current network quality
 * @returns Boolean indicating if high-end features should be enabled
 */
export const shouldEnableHighEndFeatures = (
  networkType: NetworkType,
  networkQuality: NetworkQuality
): boolean => {
  // Check if device is capable of high-end features
  const isCapableDevice = !Platform.isMobile() || Platform.isHighEndDevice();
  
  if (!isCapableDevice) {
    return false;
  }
  
  // Enable on good wifi/ethernet connections
  if ((networkType === 'wifi' || networkType === 'ethernet') && 
      (networkQuality === 'excellent' || networkQuality === 'good')) {
    return true;
  }
  
  // Enable on excellent 5G
  if (networkType === 'cellular_5g' && networkQuality === 'excellent') {
    return true;
  }
  
  return false;
};

/**
 * Get appropriate batch size for data fetching based on network conditions
 * @param defaultBatchSize Default number of items to fetch
 * @param networkType Current network type
 * @param networkQuality Current network quality
 * @returns Adjusted batch size
 */
export const getAdaptiveBatchSize = (
  defaultBatchSize: number,
  networkType: NetworkType,
  networkQuality: NetworkQuality
): number => {
  let multiplier = 1;
  
  // Adjust based on network quality
  switch (networkQuality) {
    case 'excellent':
      multiplier = 1.5;
      break;
    case 'good':
      multiplier = 1.2;
      break;
    case 'fair':
      multiplier = 1;
      break;
    case 'poor':
      multiplier = 0.7;
      break;
    case 'very-poor':
      multiplier = 0.5;
      break;
    default:
      multiplier = 1;
  }
  
  // Further adjust based on network type
  if (networkType === 'none') {
    multiplier = 0.3;
  } else if (networkType === 'wifi' || networkType === 'ethernet') {
    multiplier *= 1.2;
  } else if (networkType.includes('cellular') && networkType !== 'cellular_5g') {
    multiplier *= 0.8;
  }
  
  // Calculate new batch size and ensure it's at least 5
  return Math.max(5, Math.round(defaultBatchSize * multiplier));
};
