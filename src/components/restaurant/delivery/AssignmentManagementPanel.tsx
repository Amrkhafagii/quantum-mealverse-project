
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRestaurantDeliveryHandoff } from '@/hooks/useRestaurantDeliveryHandoff';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import { Settings, MapPin, Clock, Star, RefreshCw } from 'lucide-react';

interface AssignmentManagementPanelProps {
  onDriversUpdate?: (drivers: any[]) => void;
}

export const AssignmentManagementPanel: React.FC<AssignmentManagementPanelProps> = ({
  onDriversUpdate
}) => {
  const { restaurant } = useRestaurantAuth();
  const [restaurantLocation, setRestaurantLocation] = useState<{lat: number; lng: number} | null>(null);
  
  const {
    criteria,
    availableDrivers,
    loading,
    loadAvailableDrivers,
    updateCriteria,
    processExpiredAssignments
  } = useRestaurantDeliveryHandoff(restaurant?.id);

  // Load restaurant location
  useEffect(() => {
    if (restaurant?.latitude && restaurant?.longitude) {
      setRestaurantLocation({
        lat: restaurant.latitude,
        lng: restaurant.longitude
      });
    }
  }, [restaurant]);

  // Load drivers when location is available
  useEffect(() => {
    if (restaurantLocation) {
      loadAvailableDrivers(restaurantLocation.lat, restaurantLocation.lng);
    }
  }, [restaurantLocation, loadAvailableDrivers]);

  // Update parent component with drivers
  useEffect(() => {
    onDriversUpdate?.(availableDrivers);
  }, [availableDrivers, onDriversUpdate]);

  const handleCriteriaUpdate = async (field: string, value: number) => {
    if (!criteria) return;
    
    await updateCriteria({
      [field]: value
    });
    
    // Reload drivers with new criteria
    if (restaurantLocation) {
      loadAvailableDrivers(restaurantLocation.lat, restaurantLocation.lng);
    }
  };

  const refreshDrivers = () => {
    if (restaurantLocation) {
      loadAvailableDrivers(restaurantLocation.lat, restaurantLocation.lng);
    }
  };

  if (!restaurant) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Restaurant information not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assignment Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Assignment Criteria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {criteria ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxDistance">Max Distance (km)</Label>
                <Input
                  id="maxDistance"
                  type="number"
                  min="1"
                  max="50"
                  step="0.5"
                  value={criteria.max_distance_km}
                  onChange={(e) => handleCriteriaUpdate('max_distance_km', parseFloat(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assignmentTime">Assignment Time (minutes)</Label>
                <Input
                  id="assignmentTime"
                  type="number"
                  min="5"
                  max="120"
                  value={criteria.max_assignment_time_minutes}
                  onChange={(e) => handleCriteriaUpdate('max_assignment_time_minutes', parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferredRating">Preferred Driver Rating</Label>
                <Input
                  id="preferredRating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={criteria.preferred_driver_rating}
                  onChange={(e) => handleCriteriaUpdate('preferred_driver_rating', parseFloat(e.target.value))}
                />
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Loading criteria...</p>
          )}
        </CardContent>
      </Card>

      {/* Available Drivers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Available Drivers ({availableDrivers.length})
            </CardTitle>
            <Button
              onClick={refreshDrivers}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {availableDrivers.length > 0 ? (
            <div className="space-y-3">
              {availableDrivers.map((driver) => (
                <div
                  key={driver.delivery_user_id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{driver.driver_name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {driver.average_rating.toFixed(1)}
                      </span>
                      {driver.distance_km && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {driver.distance_km} km
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {driver.current_deliveries} active
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={driver.priority_score >= 80 ? 'default' : 'secondary'}
                    >
                      Score: {driver.priority_score}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              No available drivers found within {criteria?.max_distance_km || 15} km
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={processExpiredAssignments}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            Process Expired Assignments
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
