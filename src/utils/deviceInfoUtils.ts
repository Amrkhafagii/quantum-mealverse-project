
import { UnifiedLocation } from '@/types/unifiedLocation';

// Define DeviceInfo interface
export interface DeviceInfo {
  platform: string;
  model?: string;
  manufacturer?: string;
  version?: string;
  uuid?: string;
}

// Define Platform interface
export interface Platform {
  os: string;
  version: string;
  isNative: boolean;
}

// Get device information
export function getDeviceInfo(): DeviceInfo {
  // Get basic platform info
  const platform = getPlatformInfo();
  
  return {
    platform: platform.os,
    model: 'Unknown', // Would be available on native platforms
    version: platform.version,
    uuid: generateDeviceUUID(), // Generate a pseudo-unique device ID for web
  };
}

// Get platform information
function getPlatformInfo(): Platform {
  const userAgent = navigator.userAgent;
  let os = 'unknown';
  let version = 'unknown';
  const isNative = false; // This would be true in a native mobile app context
  
  // Detect OS
  if (/Windows/i.test(userAgent)) {
    os = 'windows';
    version = userAgent.match(/Windows NT (\d+\.\d+)/)?.[1] || 'unknown';
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    os = 'ios';
    version = userAgent.match(/OS (\d+[_-]\d+)/)?.[1]?.replace('_', '.') || 'unknown';
  } else if (/Android/i.test(userAgent)) {
    os = 'android';
    version = userAgent.match(/Android (\d+\.\d+)/)?.[1] || 'unknown';
  } else if (/Mac/i.test(userAgent)) {
    os = 'macos';
    version = userAgent.match(/Mac OS X (\d+[_-]\d+)/)?.[1]?.replace('_', '.') || 'unknown';
  } else if (/Linux/i.test(userAgent)) {
    os = 'linux';
    version = 'unknown';
  }
  
  return { os, version, isNative };
}

// Generate a pseudo-unique device identifier for web browsers
function generateDeviceUUID(): string {
  // Check if we already have one stored
  const existingId = localStorage.getItem('device_uuid');
  if (existingId) {
    return existingId;
  }
  
  // Generate a new ID
  const newId = 'web-' + Math.random().toString(36).substring(2, 15) + 
    Math.random().toString(36).substring(2, 15);
  
  // Store for future use
  try {
    localStorage.setItem('device_uuid', newId);
  } catch (e) {
    console.error('Failed to store device UUID in localStorage:', e);
  }
  
  return newId;
}

// Check if device supports native features
export function supportsNativeFeatures(): boolean {
  return typeof window !== 'undefined' && 
    !!(window as any).Capacitor || 
    !!(window as any).cordova;
}
