
import React, { useState, useEffect } from 'react';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { getAdaptiveImageDimensions } from '@/utils/networkAdaptation';
import { Skeleton } from '@/components/ui/skeleton';

interface AdaptiveImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  enableLqip?: boolean;
  priority?: boolean;
}

export default function AdaptiveImage({
  src,
  alt,
  width,
  height,
  className = '',
  enableLqip = false,
  priority = false
}: AdaptiveImageProps) {
  const { quality } = useNetworkQuality();
  const [isLoading, setIsLoading] = useState(true);
  const [adaptedSrc, setAdaptedSrc] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width, height });
  
  useEffect(() => {
    // Calculate adaptive dimensions based on network quality
    const { width: adaptedWidth, height: adaptedHeight, qualityPercent } = 
      getAdaptiveImageDimensions(width, height, quality);
    
    setDimensions({ width: adaptedWidth, height: adaptedHeight });
    
    // Add quality parameters to the image URL if it's a URL that supports it
    // For demonstration - in real implementation, you might use a proper image service
    if (src.includes('picsum.photos')) {
      // For demo purposes, we'll adjust the image size from the source
      const baseUrl = new URL(src);
      const newUrl = `${baseUrl.origin}/${adaptedWidth}/${adaptedHeight}${baseUrl.search}`;
      setAdaptedSrc(newUrl);
    } else {
      setAdaptedSrc(src);
    }
  }, [src, quality, width, height]);
  
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  if (!adaptedSrc) {
    return <Skeleton className={className || `w-${width} h-${height}`} />;
  }
  
  return (
    <>
      {isLoading && <Skeleton className={className || `w-${dimensions.width} h-${dimensions.height}`} />}
      <img
        src={adaptedSrc}
        alt={alt}
        width={dimensions.width}
        height={dimensions.height}
        className={`${className} ${isLoading ? 'hidden' : 'block'}`}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
      />
    </>
  );
}
