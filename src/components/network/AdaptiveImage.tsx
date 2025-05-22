
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { getAdaptiveImageQuality, getAdaptiveImageDimensions } from '@/utils/networkAdaptation';
import { NetworkQuality, NetworkType } from '@/types/unifiedLocation';

const AdaptiveImage = () => {
  const [networkType, setNetworkType] = useState<NetworkType>('wifi');
  const [networkQuality, setNetworkQuality] = useState<NetworkQuality>('good');
  const [quality, setQuality] = useState('high');
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isLoading, setIsLoading] = useState(false);

  // Update image parameters based on network conditions
  useEffect(() => {
    // Get adaptive quality
    const adaptiveQuality = getAdaptiveImageQuality(networkType, networkQuality);
    setQuality(adaptiveQuality);
    
    // Get adaptive dimensions
    const adaptiveDimensions = getAdaptiveImageDimensions(800, 600, networkType, networkQuality);
    setDimensions(adaptiveDimensions);
    
    // Simulate loading
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    
    return () => clearTimeout(timer);
  }, [networkType, networkQuality]);

  return (
    <div className="p-4 border rounded-md space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium">Adaptive Image Demo</h3>
        <div className="flex flex-col items-end">
          <div className="text-sm text-muted-foreground">
            Quality: <span className="font-semibold">{quality}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Dimensions: <span className="font-semibold">{dimensions.width}x{dimensions.height}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label>Network Type</Label>
          <Select 
            value={networkType} 
            onValueChange={(value) => setNetworkType(value as NetworkType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wifi">WiFi</SelectItem>
              <SelectItem value="cellular_5g">5G</SelectItem>
              <SelectItem value="cellular_4g">4G</SelectItem>
              <SelectItem value="cellular_3g">3G</SelectItem>
              <SelectItem value="ethernet">Ethernet</SelectItem>
              <SelectItem value="none">No Connection</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Network Quality</Label>
          <Select 
            value={networkQuality} 
            onValueChange={(value) => setNetworkQuality(value as NetworkQuality)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
              <SelectItem value="very-poor">Very Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="w-full h-64" />
      ) : (
        <div className="relative w-full h-64 overflow-hidden rounded-md border">
          <div 
            className="w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            style={{ 
              filter: quality === 'low' ? 'blur(4px)' : 
                      quality === 'medium' ? 'blur(1px)' : 'none',
              opacity: quality === 'low' ? 0.7 : 
                       quality === 'medium' ? 0.85 : 1,
              transform: `scale(${quality === 'original' ? 1 : 0.95})`,
              transition: 'filter 0.3s, opacity 0.3s, transform 0.3s'
            }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-medium bg-black bg-opacity-40 px-4 py-2 rounded">
              Sample Image ({quality})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdaptiveImage;
