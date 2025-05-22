
import { compress, decompress } from './compressionProvider';

/**
 * Serialize and compress data for efficient storage or transmission
 * @param data Any serializable data
 * @returns Compressed string
 */
export const compressData = async <T>(data: T): Promise<string> => {
  try {
    // First convert to JSON string
    const jsonString = JSON.stringify(data);
    
    // Then compress the string
    return await compress(jsonString);
  } catch (error) {
    console.error('Error compressing data:', error);
    // Fall back to basic JSON if compression fails
    return JSON.stringify(data);
  }
};

/**
 * Decompress and deserialize data
 * @param compressedData Compressed string
 * @returns Original data object
 */
export const decompressData = async <T>(compressedData: string): Promise<T> => {
  try {
    // First decompress the string
    const jsonString = await decompress(compressedData);
    
    // Then parse the JSON
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error decompressing data:', error);
    // Try parsing directly as fallback
    return JSON.parse(compressedData) as T;
  }
};

/**
 * Check if compression would be beneficial for the given data
 * @param data Data to evaluate for compression
 * @returns True if compression is recommended
 */
export const shouldCompress = (data: any): boolean => {
  const stringified = JSON.stringify(data);
  
  // Only compress if data is large enough to benefit
  return stringified.length > 1024; // Threshold of 1KB
};

/**
 * Compress batch data if it exceeds threshold
 * @param batch Batch of data to process
 * @returns Object with compression info and data
 */
export const prepareBatchForTransmission = async <T>(
  batch: T[]
): Promise<{ 
  data: string | T[]; 
  isCompressed: boolean;
  originalSize: number;
  compressedSize?: number;
}> => {
  const stringified = JSON.stringify(batch);
  const originalSize = stringified.length;
  
  // Check if batch is large enough to benefit from compression
  if (originalSize > 1024) {
    const compressed = await compressData(batch);
    const compressedSize = compressed.length;
    
    // Only use compression if it actually reduces size
    if (compressedSize < originalSize) {
      return {
        data: compressed,
        isCompressed: true,
        originalSize,
        compressedSize
      };
    }
  }
  
  // Return uncompressed
  return {
    data: batch,
    isCompressed: false,
    originalSize
  };
};
