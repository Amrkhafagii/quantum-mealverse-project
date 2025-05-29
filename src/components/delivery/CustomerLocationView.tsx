
import React, { useEffect, useState } from 'react';
import { useRealTimeLocationSharing } from '@/hooks/useRealTimeLocationSharing';
import { etaService } from '@/services/location/etaService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Navigation, RefreshCw } from 'lucide-react';
import { DeliveryETAUpdate } from '@/types/location-sharing';

interface CustomerLocationViewProps {
  deliveryAssignmentId: string;
  orderId: string;
  driverName?: string;
  className?: string;
}

export const CustomerLocationView: React.FC<CustomerLocationViewProps> = ({
  deliveryAssignmentId,
  orderId,
  driverName,
  className = ''
}) => {
  const [etaHistory, setETAHistory] = useState<DeliveryETAUpdate[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    latestLocation,
    currentETA,
    isLocationSharingEnabled,
    privacyLevel,
    error,
    refreshLocationHistory
  } = useRealTimeLocationSharing({
    deliveryAssignmentId,
    orderId,
    enableAutoTracking: true,
    trackingInterval: 15000 // 15 seconds for customer view
  });

  // Load ETA history
  const loadETAHistory = async () => {
    setIsRefreshing(true);
    try {
      const history = await etaService.getETAUpdatesForOrder(orderId);
      setETAHistory(history);
    } catch (err) {
      console.error('Error loading ETA history:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    await Promise.all([
      refreshLocationHistory(),
      loadETAHistory()
    ]);
  };

  // Subscribe to ETA updates
  useEffect(() => {
    const unsubscribe = etaService.subscribeToETAUpdates(
      deliveryAssignmentId,
      (eta) => {
        setETAHistory(prev => [eta, ...prev.slice(0, 9)]); // Keep last 10 updates
      }
    );

    loadETAHistory();
    return unsubscribe;
  }, [deliveryAssignmentId]);

  // Calculate distance from customer location if available
  const calculateDistanceFromCustomer = (driverLat: number, driverLng: number) => {
    // This would need customer coordinates - for now return placeholder
    return null;
  };

  // Format ETA time
  const formatETA = (estimatedArrival: string) => {
    const result = etaService.calculateTimeUntilDelivery(estimatedArrival);
    return result;
  };

  if (!isLocationSharingEnabled) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Location Sharing Unavailable</h3>
          <p className="text-muted-foreground">
            Real-time location tracking is not enabled for this delivery.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {driverName ? `${driverName}'s Location` : 'Delivery Tracking'}
          </span>
          <div className="flex items-center gap-2">
            {latestLocation && (
              <Badge variant="outline" className="bg-green-500/20 text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                Live
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            Connection error: {error}
          </div>
        )}

        {/* Current ETA */}
        {currentETA && (
          <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Estimated Arrival</span>
            </div>
            <div className="space-y-1">
              {(() => {
                const timeInfo = formatETA(currentETA.estimated_arrival);
                return (
                  <>
                    <div className={`text-2xl font-bold ${timeInfo.isOverdue ? 'text-red-400' : 'text-blue-300'}`}>
                      {timeInfo.timeText}
                    </div>
                    <div className="text-sm text-blue-400">
                      Expected at {new Date(currentETA.estimated_arrival).toLocaleTimeString()}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Driver Location Info */}
        {latestLocation && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Driver Location</span>
              <Badge variant="outline" className="text-xs">
                {privacyLevel === 'precise' ? 'Precise' : 'Approximate'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Last Update:</span>
                <div>
                  {new Date(latestLocation.timestamp).toLocaleTimeString()}
                </div>
              </div>
              {latestLocation.speed !== null && latestLocation.speed !== undefined && (
                <div>
                  <span className="text-muted-foreground">Speed:</span>
                  <div className="flex items-center gap-1">
                    <Navigation className="h-3 w-3" />
                    {Math.round(latestLocation.speed * 3.6)} km/h
                  </div>
                </div>
              )}
            </div>

            {privacyLevel === 'precise' && (
              <div className="text-xs text-muted-foreground font-mono">
                Coordinates: {latestLocation.latitude.toFixed(4)}, {latestLocation.longitude.toFixed(4)}
              </div>
            )}
          </div>
        )}

        {/* ETA History */}
        {etaHistory.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Recent Updates</span>
              <span className="text-xs text-muted-foreground">
                {etaHistory.length} update{etaHistory.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {etaHistory.slice(0, 5).map((eta, index) => (
                <div key={eta.id} className="flex items-center justify-between text-xs p-2 bg-muted/50 rounded">
                  <span>
                    ETA: {eta.calculated_duration_minutes}min
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(eta.created_at).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No location state */}
        {!latestLocation && isLocationSharingEnabled && (
          <div className="text-center py-6 text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Waiting for driver location...</p>
            <p className="text-sm mt-1">Location will appear when the driver starts sharing</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
