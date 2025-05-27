import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    area_type: 'radius' as const,
    radius_km: 5,
    delivery_fee: 0,
    minimum_order_amount: 0,
    estimated_delivery_time: 30
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAreas();
  }, [restaurantId]);

  const loadAreas = async () => {
    try {
      setLoading(true);
      const deliveryAreas = await onboardingService.getDeliveryAreas(restaurantId);
      setAreas(deliveryAreas);
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
    if (!newArea.area_name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an area name',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      const area = await onboardingService.saveDeliveryArea(restaurantId, {
        ...newArea,
        center_latitude: 0, // This would be set by map integration
        center_longitude: 0, // This would be set by map integration
        priority_order: areas.length + 1,
        is_active: true
      });
      
      setAreas(prev => [...prev, area]);
      setNewArea({
        area_name: '',
        area_type: 'radius' as const,
        radius_km: 5,
        delivery_fee: 0,
        minimum_order_amount: 0,
        estimated_delivery_time: 30
      });
      
      toast({
        title: 'Success',
        description: 'Delivery area added successfully',
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
      setAreas(prev => prev.filter(a => a.id !== areaId));
      toast({
        title: 'Success',
        description: 'Delivery area deleted successfully',
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

  const handleSubmit = () => {
    if (areas.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one delivery area',
        variant: 'destructive'
      });
      return;
    }

    onComplete({ delivery_areas: areas.length });
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
      {/* Add New Area Form */}
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
                placeholder="e.g., Downtown, North Side"
                value={newArea.area_name}
                onChange={(e) => setNewArea(prev => ({ ...prev, area_name: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="area_type">Area Type</Label>
              <Select 
                value={newArea.area_type} 
                onValueChange={(value: 'radius' | 'polygon' | 'postal_codes') => 
                  setNewArea(prev => ({ ...prev, area_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="radius">Radius (km)</SelectItem>
                  <SelectItem value="postal_codes">Postal Codes</SelectItem>
                  <SelectItem value="polygon">Custom Area</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {newArea.area_type === 'radius' && (
              <div>
                <Label htmlFor="radius_km">Delivery Radius (km)</Label>
                <Input
                  id="radius_km"
                  type="number"
                  min="1"
                  max="50"
                  value={newArea.radius_km}
                  onChange={(e) => setNewArea(prev => ({ ...prev, radius_km: Number(e.target.value) }))}
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="delivery_fee">Delivery Fee</Label>
              <Input
                id="delivery_fee"
                type="number"
                min="0"
                step="0.01"
                value={newArea.delivery_fee}
                onChange={(e) => setNewArea(prev => ({ ...prev, delivery_fee: Number(e.target.value) }))}
              />
            </div>
            
            <div>
              <Label htmlFor="minimum_order_amount">Minimum Order Amount</Label>
              <Input
                id="minimum_order_amount"
                type="number"
                min="0"
                step="0.01"
                value={newArea.minimum_order_amount}
                onChange={(e) => setNewArea(prev => ({ ...prev, minimum_order_amount: Number(e.target.value) }))}
              />
            </div>
            
            <div>
              <Label htmlFor="estimated_delivery_time">Estimated Delivery Time (minutes)</Label>
              <Input
                id="estimated_delivery_time"
                type="number"
                min="10"
                max="120"
                value={newArea.estimated_delivery_time}
                onChange={(e) => setNewArea(prev => ({ ...prev, estimated_delivery_time: Number(e.target.value) }))}
              />
            </div>
          </div>
          
          <Button onClick={handleAddArea} disabled={saving} className="w-full">
            {saving ? 'Adding...' : 'Add Delivery Area'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Areas */}
      {areas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Configured Delivery Areas ({areas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {areas.map((area) => (
                <div key={area.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <h4 className="font-medium">{area.area_name}</h4>
                    <p className="text-sm text-gray-600">
                      {area.area_type === 'radius' && `${area.radius_km}km radius`}
                      {area.area_type === 'postal_codes' && 'Postal codes'}
                      {area.area_type === 'polygon' && 'Custom area'}
                      • Fee: ${area.delivery_fee} • Min: ${area.minimum_order_amount} • {area.estimated_delivery_time}min
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteArea(area.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleSubmit} className="w-full">
        Save & Continue
      </Button>
    </div>
  );
};
