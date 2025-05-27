import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { onboardingService } from '@/services/onboarding/onboardingService';
import { useRestaurantAuth } from '@/hooks/useRestaurantAuth';
import type { DeliveryArea } from '@/types/onboarding';

interface DeliveryAreasStepProps {
  restaurantId: string;
  onComplete: (data: Record<string, any>) => void;
}

export const DeliveryAreasStep: React.FC<DeliveryAreasStepProps> = ({ restaurantId, onComplete }) => {
  const { restaurant } = useRestaurantAuth();
  const { toast } = useToast();
  const [areas, setAreas] = useState<DeliveryArea[]>([]);
  const [newArea, setNewArea] = useState({
    area_name: '',
    radius_km: 5,
    delivery_fee: 0,
    minimum_order_amount: 0,
    estimated_delivery_time: 45
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAreas();
  }, [restaurantId]);

  const loadAreas = async () => {
    try {
      setLoading(true);
      const existingAreas = await onboardingService.getDeliveryAreas(restaurantId);
      setAreas(existingAreas);
    } catch (error) {
      console.error('Error loading delivery areas:', error);
      toast({
        title: 'Error',
        description: 'Failed to load delivery areas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddArea = async () => {
    if (!newArea.area_name) {
      toast({
        title: 'Missing Information',
        description: 'Please enter an area name',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      const area = await onboardingService.saveDeliveryArea(restaurantId, {
        ...newArea,
        area_type: 'radius',
        center_latitude: restaurant?.latitude || 0,
        center_longitude: restaurant?.longitude || 0,
        is_active: true,
        priority_order: areas.length + 1
      });
      
      setAreas(prev => [...prev, area]);
      setNewArea({
        area_name: '',
        radius_km: 5,
        delivery_fee: 0,
        minimum_order_amount: 0,
        estimated_delivery_time: 45
      });
      
      toast({
        title: 'Success',
        description: 'Delivery area added successfully'
      });
    } catch (error) {
      console.error('Error adding delivery area:', error);
      toast({
        title: 'Error',
        description: 'Failed to add delivery area',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteArea = async (areaId: string) => {
    try {
      await onboardingService.deleteDeliveryArea(areaId);
      setAreas(prev => prev.filter(area => area.id !== areaId));
      toast({
        title: 'Success',
        description: 'Delivery area deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting delivery area:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete delivery area',
        variant: 'destructive'
      });
    }
  };

  const handleComplete = () => {
    if (areas.length === 0) {
      toast({
        title: 'No Delivery Areas',
        description: 'Please add at least one delivery area',
        variant: 'destructive'
      });
      return;
    }

    const areasSummary = areas.map(area => ({
      name: area.area_name,
      type: area.area_type,
      radius: area.radius_km,
      delivery_fee: area.delivery_fee,
      minimum_order: area.minimum_order_amount
    }));

    onComplete({ delivery_areas: areasSummary });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add New Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Add Delivery Area
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="area_name">Area Name</Label>
              <Input
                id="area_name"
                value={newArea.area_name}
                onChange={(e) => setNewArea(prev => ({ ...prev, area_name: e.target.value }))}
                placeholder="e.g., Downtown, City Center"
              />
            </div>
            
            <div>
              <Label htmlFor="radius_km">Radius (km)</Label>
              <Input
                id="radius_km"
                type="number"
                value={newArea.radius_km}
                onChange={(e) => setNewArea(prev => ({ ...prev, radius_km: Number(e.target.value) }))}
              />
            </div>
            
            <div>
              <Label htmlFor="delivery_fee">Delivery Fee</Label>
              <Input
                id="delivery_fee"
                type="number"
                step="0.01"
                value={newArea.delivery_fee}
                onChange={(e) => setNewArea(prev => ({ ...prev, delivery_fee: Number(e.target.value) }))}
              />
            </div>
            
            <div>
              <Label htmlFor="minimum_order_amount">Minimum Order</Label>
              <Input
                id="minimum_order_amount"
                type="number"
                step="0.01"
                value={newArea.minimum_order_amount}
                onChange={(e) => setNewArea(prev => ({ ...prev, minimum_order_amount: Number(e.target.value) }))}
              />
            </div>
            
            <div>
              <Label htmlFor="estimated_delivery_time">Delivery Time (minutes)</Label>
              <Input
                id="estimated_delivery_time"
                type="number"
                value={newArea.estimated_delivery_time}
                onChange={(e) => setNewArea(prev => ({ ...prev, estimated_delivery_time: Number(e.target.value) }))}
              />
            </div>
          </div>
          
          <Button onClick={handleAddArea} disabled={saving} className="w-full">
            {saving ? 'Adding...' : 'Add Area'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Areas */}
      {areas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Configured Delivery Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {areas.map((area) => (
                <div key={area.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-quantum-cyan" />
                    <div>
                      <h4 className="font-medium">{area.area_name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{area.radius_km}km radius</span>
                        <span>•</span>
                        <span>${area.delivery_fee} delivery fee</span>
                        <span>•</span>
                        <span>${area.minimum_order_amount} min order</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={area.is_active ? 'default' : 'secondary'}>
                      {area.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteArea(area.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleComplete} disabled={areas.length === 0} className="w-full">
        Continue to Review
      </Button>
    </div>
  );
};
