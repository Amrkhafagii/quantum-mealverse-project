
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Clock, Package, Settings } from 'lucide-react';
import { useDriverAvailability } from '@/hooks/useDriverAvailability';

interface DriverAvailabilityPanelProps {
  deliveryUserId: string;
}

export const DriverAvailabilityPanel: React.FC<DriverAvailabilityPanelProps> = ({
  deliveryUserId
}) => {
  const {
    availability,
    loading,
    updateAvailability,
    updateLocation,
    toggleAvailability
  } = useDriverAvailability(deliveryUserId);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          updateLocation(
            position.coords.latitude,
            position.coords.longitude
          );
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  if (!availability) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Loading availability status...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Driver Availability
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Availability Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium">Available for Deliveries</Label>
            <p className="text-sm text-gray-500">
              Toggle to receive new delivery assignments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={availability.is_available}
              onCheckedChange={toggleAvailability}
              disabled={loading}
            />
            <Badge variant={availability.is_available ? 'default' : 'secondary'}>
              {availability.is_available ? 'Available' : 'Unavailable'}
            </Badge>
          </div>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Current Deliveries
            </Label>
            <div className="text-2xl font-bold">
              {availability.current_delivery_count} / {availability.max_concurrent_deliveries}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Last Update
            </Label>
            <div className="text-sm text-gray-600">
              {new Date(availability.last_location_update).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Location Status */}
        <div className="space-y-4">
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location Status
          </Label>
          
          {availability.current_latitude && availability.current_longitude ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 font-medium">Location Active</p>
              <p className="text-sm text-green-600">
                Lat: {availability.current_latitude.toFixed(4)}, 
                Lng: {availability.current_longitude.toFixed(4)}
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-yellow-800 font-medium">Location Not Set</p>
              <p className="text-sm text-yellow-600">
                Update your location to receive nearby assignments
              </p>
            </div>
          )}
          
          <Button 
            onClick={getCurrentLocation}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            Update Current Location
          </Button>
        </div>

        {/* Settings */}
        <div className="space-y-4 border-t pt-4">
          <Label>Delivery Preferences</Label>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxDeliveries">Max Concurrent Deliveries</Label>
              <Input
                id="maxDeliveries"
                type="number"
                min="1"
                max="5"
                value={availability.max_concurrent_deliveries}
                onChange={(e) => updateAvailability({
                  max_concurrent_deliveries: parseInt(e.target.value) || 1
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="radius">Availability Radius (km)</Label>
              <Input
                id="radius"
                type="number"
                min="1"
                max="50"
                step="0.5"
                value={availability.availability_radius_km}
                onChange={(e) => updateAvailability({
                  availability_radius_km: parseFloat(e.target.value) || 20.0
                })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
