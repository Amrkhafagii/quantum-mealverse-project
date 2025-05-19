
import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { getAdaptiveImageDimensions } from '@/utils/networkAdaptation';

interface AdaptiveImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  fallbackSrc?: string;
  placeholderColor?: string;
  enableLqip?: boolean; // Low Quality Image Placeholder
}

/**
 * Network-aware image component that adapts quality based on connection
 */
export const AdaptiveImage: React.FC<AdaptiveImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fallbackSrc,
  placeholderColor = '#f0f0f0',
  enableLqip = true
}) => {
  const [isLoading, setIsLoading] = useState(!priority);
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);
  const { quality, isLowQuality } = useNetworkQuality();
  const { isOnline } = useConnectionStatus();
  
  // Determine optimal image dimensions based on network quality
  const dimensions = getAdaptiveImageDimensions(width, height, quality);
  
  useEffect(() => {
    if (!isOnline && fallbackSrc) {
      setImgSrc(fallbackSrc);
      return;
    }
    
    // For low quality connections, we might modify the image URL
    // to request a lower quality version from the server
    if (isLowQuality) {
      // This is a simplified example. In reality, you would use a proper
      // image optimization service like Cloudinary, Imgix, etc.
      const qualityParam = isLowQuality ? '?quality=low' : '';
      if (!src.includes('?')) {
        setImgSrc(`${src}${qualityParam}`);
      }
    } else {
      setImgSrc(src);
    }
  }, [src, isOnline, isLowQuality, fallbackSrc]);
  
  // Placeholder dimensions should match the actual image dimensions ratio
  const placeholderWidth = dimensions.width || width;
  const placeholderHeight = dimensions.height || height;
  
  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
  };
  
  const handleError = () => {
    setError(true);
    setIsLoading(false);
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };
  
  // Generate a simple LQIP (Low Quality Image Placeholder) for offline mode
  const generatePlaceholder = () => {
    const aspectRatio = width / height;
    return (
      <div
        className={`bg-gray-200 dark:bg-gray-700 overflow-hidden ${className}`}
        style={{
          width: placeholderWidth,
          height: placeholderHeight,
          backgroundColor: placeholderColor,
        }}
        aria-label={alt}
      >
        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
          {alt || 'Image'}
        </div>
      </div>
    );
  };
  
  if (!isOnline && !fallbackSrc && !enableLqip) {
    return generatePlaceholder();
  }

  return (
    <div className={`relative ${className}`} style={{ width: placeholderWidth, height: placeholderHeight }}>
      {isLoading && <Skeleton className="absolute inset-0" />}
      
      {enableLqip && <div 
        className={`absolute inset-0 bg-gray-200 dark:bg-gray-700 transition-opacity duration-300 ${isLoading ? 'opacity-100' : 'opacity-0'}`}
        style={{ backgroundColor: placeholderColor }}
      />}
      
      {error && !fallbackSrc && generatePlaceholder()}
      
      {(!error || fallbackSrc) && (
        <img
          src={imgSrc}
          alt={alt}
          width={dimensions.width}
          height={dimensions.height}
          className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300 ${className}`}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default AdaptiveImage;
