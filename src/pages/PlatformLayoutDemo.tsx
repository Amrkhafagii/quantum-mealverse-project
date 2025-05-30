
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Monitor, Tablet } from 'lucide-react';
import { PlatformContainer } from '@/components/layout/PlatformContainer';
import { useResponsive } from '@/responsive/core/ResponsiveContext';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';

const PlatformLayoutDemo = () => {
  const { isMobile, isTablet, isPlatformIOS, isPlatformAndroid } = useResponsive();
  const { orientation, angle } = useDeviceOrientation();

  return (
    <PlatformContainer className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Platform Layout Demo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Device Type</h3>
                <div className="flex gap-2">
                  {isMobile && <Badge>Mobile</Badge>}
                  {isTablet && <Badge>Tablet</Badge>}
                  {!isMobile && !isTablet && <Badge>Desktop</Badge>}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Platform</h3>
                <div className="flex gap-2">
                  {isPlatformIOS && <Badge variant="outline">iOS</Badge>}
                  {isPlatformAndroid && <Badge variant="outline">Android</Badge>}
                  {!isPlatformIOS && !isPlatformAndroid && <Badge variant="outline">Web</Badge>}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Orientation</h3>
                <div className="flex gap-2">
                  <Badge variant="secondary">{orientation}</Badge>
                  {angle !== null && <Badge variant="secondary">{angle}°</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Responsive Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }, (_, i) => (
                <Card key={i} className="p-4">
                  <h4 className="font-medium mb-2">Card {i + 1}</h4>
                  <p className="text-sm text-gray-600">
                    This card adapts to different screen sizes and platforms.
                  </p>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PlatformContainer>
  );
};

export default PlatformLayoutDemo;
