import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Smartphone, 
  Monitor, 
  Wifi, 
  WifiOff, 
  MapPin, 
  Battery,
  Signal,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useNetworkQuality } from '@/responsive/core/hooks';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';

interface MobileStatusDebugProps {
  locationStatus?: string;
  networkStatus?: string;
  batteryLevel?: number;
  signalStrength?: number;
}

export const MobileStatusDebug: React.FC<MobileStatusDebugProps> = ({
  locationStatus,
  networkStatus,
  batteryLevel,
  signalStrength
}) => {
  const { isOnline, connectionType } = useConnectionStatus();
  const { quality, isLowQuality } = useNetworkQuality();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mobile Status Debug</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-4 w-4" />
            <span>Device Status</span>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>Location:</span>
              </div>
              <Badge variant="secondary">{locationStatus || 'Unknown'}</Badge>
            </div>
            
            <div>
              <div className="flex items-center space-x-1">
                <Wifi className="h-3 w-3" />
                <span>Network:</span>
              </div>
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>
            
            <div>
              <div className="flex items-center space-x-1">
                <Battery className="h-3 w-3" />
                <span>Battery:</span>
              </div>
              <Badge variant="secondary">{batteryLevel ? `${batteryLevel}%` : 'Unknown'}</Badge>
            </div>
            
            <div>
              <div className="flex items-center space-x-1">
                <Signal className="h-3 w-3" />
                <span>Signal:</span>
              </div>
              <Badge variant="secondary">{signalStrength || 'Unknown'}</Badge>
            </div>
            
            <div>
              <div className="flex items-center space-x-1">
                <Wifi className="h-3 w-3" />
                <span>Connection:</span>
              </div>
              <Badge variant="secondary">{connectionType || 'Unknown'}</Badge>
            </div>
            
            <div>
              <div className="flex items-center space-x-1">
                <Wifi className="h-3 w-3" />
                <span>Quality:</span>
              </div>
              <Badge variant={isLowQuality ? "destructive" : "secondary"}>
                {quality || 'Unknown'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
