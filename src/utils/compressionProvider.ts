
/**
 * Fallback compression using built-in browser APIs when available
 * or string encoding tricks when not
 */

/**
 * Compress a string
 */
export const compress = async (input: string): Promise<string> => {
  // Check if browser compression is available (TextEncoder + CompressionStream)
  if (typeof TextEncoder !== 'undefined' && typeof CompressionStream !== 'undefined') {
    try {
      const encoder = new TextEncoder();
      const encodedInput = encoder.encode(input);
      
      const compressedStream = new Blob([encodedInput])
        .stream()
        // @ts-ignore - CompressionStream might not be recognized by TypeScript
        .pipeThrough(new CompressionStream('gzip'));
      
      const compressedBlob = await new Response(compressedStream).blob();
      const compressedBuffer = await compressedBlob.arrayBuffer();
      
      // Convert to base64 for storage
      return btoa(
        Array.from(new Uint8Array(compressedBuffer))
          .map(byte => String.fromCharCode(byte))
          .join('')
      );
    } catch (error) {
      console.warn('Browser compression failed, using fallback:', error);
    }
  }
  
  // Fallback for browsers without CompressionStream: simple Base64 encoding
  // Not actual compression but provides consistent API
  return btoa(encodeURIComponent(input));
};

/**
 * Decompress a string
 */
export const decompress = async (compressed: string): Promise<string> => {
  // Try the browser decompression first
  if (typeof TextDecoder !== 'undefined' && typeof DecompressionStream !== 'undefined') {
    try {
      // Convert from base64 to binary
      const binaryString = atob(compressed);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const decompressedStream = new Blob([bytes])
        .stream()
        // @ts-ignore - DecompressionStream might not be recognized by TypeScript
        .pipeThrough(new DecompressionStream('gzip'));
      
      const decompressedBlob = await new Response(decompressedStream).blob();
      const decompressedText = await decompressedBlob.text();
      
      return decompressedText;
    } catch (error) {
      console.warn('Browser decompression failed, using fallback:', error);
    }
  }
  
  // Fallback for browsers without DecompressionStream
  return decodeURIComponent(atob(compressed));
};
