
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, MapPin, Edit, Trash2 } from 'lucide-react';
import { deliveryManagementService } from '@/services/admin/deliveryManagementService';
import type { DeliveryZone } from '@/types/admin';

export const DeliveryZonesMap: React.FC = () => {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newZone, setNewZone] = useState({
    name: '',
    max_delivery_distance: 10,
    base_delivery_fee: 5,
    per_km_fee: 1,
    priority_level: 1,
    is_active: true
  });

  const loadZones = async () => {
    setLoading(true);
    try {
      const data = await deliveryManagementService.getDeliveryZones();
      setZones(data);
    } catch (error) {
      console.error('Error loading zones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  const handleCreateZone = async () => {
    try {
      // Create a simple polygon for demo (would be drawn on map in real implementation)
      const polygon = {
        type: 'Polygon',
        coordinates: [[
          [-74.0059, 40.7128], // NYC coordinates as example
          [-74.0059, 40.7628],
          [-73.9559, 40.7628], 
          [-73.9559, 40.7128],
          [-74.0059, 40.7128]
        ]]
      };

      await deliveryManagementService.createDeliveryZone({
        ...newZone,
        polygon
      });

      setIsCreateDialogOpen(false);
      setNewZone({
        name: '',
        max_delivery_distance: 10,
        base_delivery_fee: 5,
        per_km_fee: 1,
        priority_level: 1,
        is_active: true
      });
      loadZones();
    } catch (error) {
      console.error('Error creating zone:', error);
    }
  };

  const toggleZoneStatus = async (zone: DeliveryZone) => {
    try {
      await deliveryManagementService.updateDeliveryZone(zone.id, {
        is_active: !zone.is_active
      });
      loadZones();
    } catch (error) {
      console.error('Error updating zone:', error);
    }
  };

  if (loading) {
    return (
      <Card className="holographic-card">
        <CardContent className="p-6">
          <div className="text-center text-quantum-cyan">Loading delivery zones...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="holographic-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-quantum-cyan">Delivery Zones</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Zone
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Delivery Zone</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="zone-name">Zone Name</Label>
                    <Input
                      id="zone-name"
                      value={newZone.name}
                      onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                      placeholder="Enter zone name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="max-distance">Max Distance (km)</Label>
                      <Input
                        id="max-distance"
                        type="number"
                        value={newZone.max_delivery_distance}
                        onChange={(e) => setNewZone({ 
                          ...newZone, 
                          max_delivery_distance: parseFloat(e.target.value) 
                        })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="base-fee">Base Fee ($)</Label>
                      <Input
                        id="base-fee"
                        type="number"
                        step="0.01"
                        value={newZone.base_delivery_fee}
                        onChange={(e) => setNewZone({ 
                          ...newZone, 
                          base_delivery_fee: parseFloat(e.target.value) 
                        })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="per-km-fee">Per KM Fee ($)</Label>
                      <Input
                        id="per-km-fee"
                        type="number"
                        step="0.01"
                        value={newZone.per_km_fee}
                        onChange={(e) => setNewZone({ 
                          ...newZone, 
                          per_km_fee: parseFloat(e.target.value) 
                        })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="priority">Priority Level</Label>
                      <Input
                        id="priority"
                        type="number"
                        value={newZone.priority_level}
                        onChange={(e) => setNewZone({ 
                          ...newZone, 
                          priority_level: parseInt(e.target.value) 
                        })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newZone.is_active}
                      onCheckedChange={(checked) => setNewZone({ ...newZone, is_active: checked })}
                    />
                    <Label>Active Zone</Label>
                  </div>

                  <Button 
                    onClick={handleCreateZone} 
                    className="w-full"
                    disabled={!newZone.name.trim()}
                  >
                    Create Zone
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map((zone) => (
              <Card key={zone.id} className="border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold">{zone.name}</h3>
                    <Badge variant={zone.is_active ? 'default' : 'secondary'}>
                      {zone.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Max Distance:</span>
                      <span>{zone.max_delivery_distance} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base Fee:</span>
                      <span>${zone.base_delivery_fee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Per KM:</span>
                      <span>${zone.per_km_fee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Priority:</span>
                      <span>{zone.priority_level}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleZoneStatus(zone)}
                    >
                      {zone.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {zones.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No delivery zones configured</p>
              <p className="text-sm">Create your first delivery zone to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
