
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, MapPin, Users, Shield } from 'lucide-react';
import { AvailabilityScheduleManager } from './availability/AvailabilityScheduleManager';
import { BreakTimeSettings } from './availability/BreakTimeSettings';
import { AutoStatusSettings } from './availability/AutoStatusSettings';
import { EmergencyContactSettings } from './availability/EmergencyContactSettings';
import { useDeliveryAvailability } from '@/hooks/useDeliveryAvailability';

interface AdvancedLocationSettingsProps {
  deliveryUserId: string;
}

export const AdvancedLocationSettings: React.FC<AdvancedLocationSettingsProps> = ({
  deliveryUserId
}) => {
  const availabilityHook = useDeliveryAvailability(deliveryUserId);

  if (availabilityHook.loading) {
    return (
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="text-quantum-cyan">Loading availability settings...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardHeader>
          <CardTitle>Working Hours & Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="breaks" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Breaks
              </TabsTrigger>
              <TabsTrigger value="auto-status" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Auto Status
              </TabsTrigger>
              <TabsTrigger value="emergency" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Emergency
              </TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="mt-6">
              <AvailabilityScheduleManager {...availabilityHook} />
            </TabsContent>

            <TabsContent value="breaks" className="mt-6">
              <BreakTimeSettings {...availabilityHook} />
            </TabsContent>

            <TabsContent value="auto-status" className="mt-6">
              <AutoStatusSettings {...availabilityHook} />
            </TabsContent>

            <TabsContent value="emergency" className="mt-6">
              <EmergencyContactSettings {...availabilityHook} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
