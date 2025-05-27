
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, AlertTriangle, Plus, Minus, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface InventoryItem {
  id: string;
  ingredient_name: string;
  current_stock: number;
  minimum_stock: number;
  unit: string;
  cost_per_unit: number;
  is_available: boolean;
  quality_grade?: string;
  storage_location?: string;
  batch_number?: string;
  last_restocked?: string;
}

interface KitchenInventoryManagerProps {
  restaurantId: string;
}

export const KitchenInventoryManager: React.FC<KitchenInventoryManagerProps> = ({
  restaurantId
}) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('restaurant_ingredient_inventory')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('ingredient_name');

      if (error) {
        console.error('Error fetching inventory:', error);
        setError('Failed to load inventory');
        return;
      }

      setInventory(data || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (itemId: string, newStock: number) => {
    try {
      setUpdating(itemId);
      
      const { error } = await supabase
        .from('restaurant_ingredient_inventory')
        .update({
          current_stock: Math.max(0, newStock),
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) {
        console.error('Error updating stock:', error);
        throw error;
      }

      setInventory(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, current_stock: Math.max(0, newStock) }
          : item
      ));

      toast({
        title: "Success",
        description: "Stock updated successfully",
      });
    } catch (err) {
      console.error('Error updating stock:', err);
      setError('Failed to update stock');
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const toggleAvailability = async (itemId: string, isAvailable: boolean) => {
    try {
      setUpdating(itemId);
      
      const { error } = await supabase
        .from('restaurant_ingredient_inventory')
        .update({
          is_available: isAvailable,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) {
        console.error('Error updating availability:', error);
        throw error;
      }

      setInventory(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, is_available: isAvailable }
          : item
      ));

      toast({
        title: "Success",
        description: "Availability updated successfully",
      });
    } catch (err) {
      console.error('Error updating availability:', err);
      setError('Failed to update availability');
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchInventory();
    }
  }, [restaurantId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading inventory...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const lowStockItems = inventory.filter(item => item.current_stock <= item.minimum_stock);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Kitchen Inventory Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {lowStockItems.length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {lowStockItems.length} ingredient(s) are running low on stock
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            {inventory.map((item) => (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium">{item.ingredient_name}</h3>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-600 mt-1">
                      <span>Cost: ${item.cost_per_unit.toFixed(2)} per {item.unit}</span>
                      {item.quality_grade && (
                        <Badge variant="outline" className="text-xs">
                          {item.quality_grade}
                        </Badge>
                      )}
                      {item.storage_location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {item.storage_location}
                        </span>
                      )}
                    </div>
                    {item.batch_number && (
                      <p className="text-xs text-gray-500 mt-1">
                        Batch: {item.batch_number}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.current_stock <= item.minimum_stock && (
                      <Badge variant="destructive">Low Stock</Badge>
                    )}
                    <Badge variant={item.is_available ? "default" : "secondary"}>
                      {item.is_available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStock(item.id, item.current_stock - 100)}
                      disabled={updating === item.id || item.current_stock <= 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <div className="text-center">
                      <div className="text-lg font-semibold">
                        {item.current_stock} {item.unit}
                      </div>
                      <div className="text-xs text-gray-500">
                        Min: {item.minimum_stock} {item.unit}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStock(item.id, item.current_stock + 100)}
                      disabled={updating === item.id}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    variant={item.is_available ? "destructive" : "default"}
                    onClick={() => toggleAvailability(item.id, !item.is_available)}
                    disabled={updating === item.id}
                  >
                    {item.is_available ? "Mark Unavailable" : "Mark Available"}
                  </Button>
                </div>

                {item.last_restocked && (
                  <div className="text-xs text-gray-500 mt-2">
                    Last restocked: {new Date(item.last_restocked).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>

          {inventory.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No inventory items found. Inventory will be populated when meals are added.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
