
import { DeliveryLocation } from '@/types/location';

/**
 * Conflict resolution strategies
 */
export enum ConflictStrategy {
  SERVER_WINS = 'server_wins',
  CLIENT_WINS = 'client_wins',
  TIMESTAMP_WINS = 'timestamp_wins',
  MERGE = 'merge',
  MANUAL = 'manual'
}

/**
 * Conflict metadata for tracking version history
 */
export interface ConflictMetadata {
  version: number;
  lastSyncedVersion?: number;
  lastModified: string;
  serverLastModified?: string;
  clientId: string;
  conflictDetected?: boolean;
  conflictResolution?: ConflictStrategy;
  conflictDetails?: string;
}

/**
 * Add metadata to a record for conflict detection
 */
export const prepareForSync = <T extends object>(
  record: T, 
  clientId: string,
  existingMetadata?: ConflictMetadata
): T & { _metadata: ConflictMetadata } => {
  // Create or update metadata
  const metadata: ConflictMetadata = existingMetadata 
    ? {
        ...existingMetadata,
        version: existingMetadata.version + 1,
        lastModified: new Date().toISOString(),
      }
    : {
        version: 1,
        lastModified: new Date().toISOString(),
        clientId,
      };
  
  return {
    ...record,
    _metadata: metadata
  };
};

/**
 * Check if there's a conflict between local and server versions
 */
export const detectConflict = <T extends { _metadata?: ConflictMetadata }>(
  localRecord: T,
  serverRecord: T
): boolean => {
  if (!localRecord._metadata || !serverRecord._metadata) {
    return false; // No metadata to check
  }
  
  // If server has newer version than what client last synced
  if (serverRecord._metadata.version > (localRecord._metadata.lastSyncedVersion || 0)) {
    // Check if local record was also modified since last sync
    return localRecord._metadata.version > (localRecord._metadata.lastSyncedVersion || 0);
  }
  
  return false;
};

/**
 * Resolve conflicts between local and server records
 */
export const resolveConflict = <T extends object>(
  localRecord: T & { _metadata?: ConflictMetadata },
  serverRecord: T & { _metadata?: ConflictMetadata },
  strategy: ConflictStrategy = ConflictStrategy.TIMESTAMP_WINS
): T => {
  if (!localRecord._metadata || !serverRecord._metadata) {
    return strategy === ConflictStrategy.SERVER_WINS ? serverRecord : localRecord;
  }
  
  switch (strategy) {
    case ConflictStrategy.SERVER_WINS:
      return {
        ...serverRecord,
        _metadata: {
          ...serverRecord._metadata,
          lastSyncedVersion: serverRecord._metadata.version,
          conflictDetected: true,
          conflictResolution: ConflictStrategy.SERVER_WINS
        }
      };
      
    case ConflictStrategy.CLIENT_WINS:
      return {
        ...localRecord,
        _metadata: {
          ...localRecord._metadata,
          lastSyncedVersion: serverRecord._metadata.version,
          conflictDetected: true,
          conflictResolution: ConflictStrategy.CLIENT_WINS
        }
      };
      
    case ConflictStrategy.TIMESTAMP_WINS: {
      const useServer = new Date(serverRecord._metadata.lastModified) > 
                        new Date(localRecord._metadata.lastModified);
      
      return useServer 
        ? {
            ...serverRecord,
            _metadata: {
              ...serverRecord._metadata,
              lastSyncedVersion: serverRecord._metadata.version,
              conflictDetected: true,
              conflictResolution: ConflictStrategy.TIMESTAMP_WINS
            }
          } 
        : {
            ...localRecord,
            _metadata: {
              ...localRecord._metadata,
              lastSyncedVersion: serverRecord._metadata.version,
              conflictDetected: true,
              conflictResolution: ConflictStrategy.TIMESTAMP_WINS
            }
          };
    }
      
    case ConflictStrategy.MERGE:
      return mergeRecords(localRecord, serverRecord);
      
    case ConflictStrategy.MANUAL:
    default:
      // For manual resolution, mark the conflict but return local version for now
      return {
        ...localRecord,
        _metadata: {
          ...localRecord._metadata,
          conflictDetected: true,
          conflictResolution: ConflictStrategy.MANUAL,
          conflictDetails: JSON.stringify(serverRecord)
        }
      };
  }
};

/**
 * Smart merge of two records (specialized for location data)
 */
const mergeRecords = <T extends object>(
  localRecord: T & { _metadata?: ConflictMetadata },
  serverRecord: T & { _metadata?: ConflictMetadata }
): T => {
  // Check if we're dealing with location data
  if ('latitude' in localRecord && 'longitude' in localRecord && 
      'latitude' in serverRecord && 'longitude' in serverRecord) {
    // For location data, prioritize server data for most fields except accuracy
    const localAsLocation = localRecord as unknown as DeliveryLocation;
    const serverAsLocation = serverRecord as unknown as DeliveryLocation;
    
    // Use the more accurate reading
    const useLocalAccuracy = (localAsLocation.accuracy || 100) < (serverAsLocation.accuracy || 100);
    
    const result = {
      ...serverRecord,
      accuracy: useLocalAccuracy ? localAsLocation.accuracy : serverAsLocation.accuracy,
      _metadata: {
        ...localRecord._metadata,
        version: Math.max(
          localRecord._metadata?.version || 0, 
          serverRecord._metadata?.version || 0
        ) + 1,
        lastSyncedVersion: serverRecord._metadata?.version,
        lastModified: new Date().toISOString(),
        serverLastModified: serverRecord._metadata?.lastModified,
        conflictDetected: true,
        conflictResolution: ConflictStrategy.MERGE
      }
    };
    
    return result as unknown as T;
  }
  
  // Generic merge for other data types: merge all properties
  const merged = {
    ...localRecord,
    ...serverRecord,
    _metadata: {
      ...localRecord._metadata,
      version: Math.max(
        localRecord._metadata?.version || 0, 
        serverRecord._metadata?.version || 0
      ) + 1,
      lastSyncedVersion: serverRecord._metadata?.version,
      lastModified: new Date().toISOString(),
      serverLastModified: serverRecord._metadata?.lastModified,
      conflictDetected: true,
      conflictResolution: ConflictStrategy.MERGE
    }
  };
  
  return merged;
};
