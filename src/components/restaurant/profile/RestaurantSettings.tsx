
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';
import { restaurantService, type Restaurant, type RestaurantSettings as Settings } from '@/services/restaurantService';

const settingsSchema = z.object({
  notifications_enabled: z.boolean(),
  auto_accept_orders: z.boolean(),
  order_preparation_time: z.number().min(10).max(120),
  max_daily_orders: z.number().min(1).optional(),
  operating_status: z.enum(['open', 'busy', 'closed', 'temporarily_closed']),
  special_instructions: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface Props {
  restaurant: Restaurant;
}

export const RestaurantSettings: React.FC<Props> = ({ restaurant }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    loadSettings();
  }, [restaurant.id]);

  const loadSettings = async () => {
    try {
      setLoadingSettings(true);
      const data = await restaurantService.getRestaurantSettings(restaurant.id);
      if (data) {
        setSettings(data);
        form.reset({
          notifications_enabled: data.notifications_enabled,
          auto_accept_orders: data.auto_accept_orders,
          order_preparation_time: data.order_preparation_time,
          max_daily_orders: data.max_daily_orders || undefined,
          operating_status: data.operating_status,
          special_instructions: data.special_instructions || '',
        });
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load restaurant settings",
        variant: "destructive",
      });
    } finally {
      setLoadingSettings(false);
    }
  };

  const onSubmit = async (data: SettingsFormData) => {
    if (!settings) return;

    try {
      setLoading(true);
      const updatedSettings = await restaurantService.updateRestaurantSettings(restaurant.id, data);
      setSettings(updatedSettings);
      toast({
        title: "Success",
        description: "Restaurant settings updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update restaurant settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingSettings) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
        <span className="ml-2 text-quantum-cyan">Loading settings...</span>
      </div>
    );
  }

  if (!settings) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Settings Not Found</h3>
          <p className="text-gray-600">Unable to load restaurant settings.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Restaurant Settings</CardTitle>
        <CardDescription>
          Configure your restaurant's operational settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications</Label>
                  <p className="text-sm text-gray-500">Receive order notifications</p>
                </div>
                <Switch
                  checked={form.watch('notifications_enabled')}
                  onCheckedChange={(checked) => form.setValue('notifications_enabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Accept Orders</Label>
                  <p className="text-sm text-gray-500">Automatically accept incoming orders</p>
                </div>
                <Switch
                  checked={form.watch('auto_accept_orders')}
                  onCheckedChange={(checked) => form.setValue('auto_accept_orders', checked)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="operating_status">Operating Status</Label>
                <Select
                  value={form.watch('operating_status')}
                  onValueChange={(value) => form.setValue('operating_status', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="temporarily_closed">Temporarily Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order_preparation_time">Order Preparation Time (minutes)</Label>
                <Input
                  id="order_preparation_time"
                  type="number"
                  min="10"
                  max="120"
                  {...form.register('order_preparation_time', { valueAsNumber: true })}
                  error={form.formState.errors.order_preparation_time?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_daily_orders">Maximum Daily Orders (optional)</Label>
                <Input
                  id="max_daily_orders"
                  type="number"
                  min="1"
                  placeholder="No limit"
                  {...form.register('max_daily_orders', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_instructions">Special Instructions</Label>
            <Textarea
              id="special_instructions"
              placeholder="Any special instructions for customers or delivery partners..."
              className="min-h-[100px]"
              {...form.register('special_instructions')}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
