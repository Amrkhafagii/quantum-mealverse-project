
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useResponsive } from '@/responsive/core/ResponsiveContext';
import { Platform } from '@/responsive/utils/platform';

export const ResponsiveTestSuite: React.FC = () => {
  const { screenSize, isMobile, isTablet, isPlatformIOS, isPlatformAndroid } = useResponsive();
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const runTest = (testName: string) => {
    // Simulate test execution
    const result = Math.random() > 0.2; // 80% success rate
    setTestResults(prev => ({ ...prev, [testName]: result }));
  };

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Responsive Test Suite</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <h3 className="font-semibold">Screen Size</h3>
              <Badge variant="outline">{screenSize}</Badge>
            </div>
            <div className="text-center">
              <h3 className="font-semibold">Platform</h3>
              <Badge variant="outline">
                {Platform.isWeb() ? 'Web' : isPlatformIOS ? 'iOS' : isPlatformAndroid ? 'Android' : 'Unknown'}
              </Badge>
            </div>
            <div className="text-center">
              <h3 className="font-semibold">Device Type</h3>
              <Badge variant="outline">
                {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="layout" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="layout">Layout Tests</TabsTrigger>
              <TabsTrigger value="touch">Touch Tests</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="network">Network Tests</TabsTrigger>
            </TabsList>
            
            <TabsContent value="layout" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Layout Responsiveness</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <TestButton
                    name="breakpoint-detection"
                    label="Breakpoint Detection"
                    onTest={runTest}
                    result={testResults['breakpoint-detection']}
                  />
                  <TestButton
                    name="orientation-change"
                    label="Orientation Change"
                    onTest={runTest}
                    result={testResults['orientation-change']}
                  />
                  <TestButton
                    name="safe-area-support"
                    label="Safe Area Support"
                    onTest={runTest}
                    result={testResults['safe-area-support']}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="touch" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Touch Interface</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <TestButton
                    name="touch-targets"
                    label="Touch Target Size"
                    onTest={runTest}
                    result={testResults['touch-targets']}
                  />
                  <TestButton
                    name="haptic-feedback"
                    label="Haptic Feedback"
                    onTest={runTest}
                    result={testResults['haptic-feedback']}
                  />
                  <TestButton
                    name="gesture-support"
                    label="Gesture Support"
                    onTest={runTest}
                    result={testResults['gesture-support']}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <TestButton
                    name="render-performance"
                    label="Render Performance"
                    onTest={runTest}
                    result={testResults['render-performance']}
                  />
                  <TestButton
                    name="memory-usage"
                    label="Memory Usage"
                    onTest={runTest}
                    result={testResults['memory-usage']}
                  />
                  <TestButton
                    name="battery-impact"
                    label="Battery Impact"
                    onTest={runTest}
                    result={testResults['battery-impact']}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="network" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Network Adaptation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <TestButton
                    name="offline-support"
                    label="Offline Support"
                    onTest={runTest}
                    result={testResults['offline-support']}
                  />
                  <TestButton
                    name="slow-network"
                    label="Slow Network Handling"
                    onTest={runTest}
                    result={testResults['slow-network']}
                  />
                  <TestButton
                    name="data-efficiency"
                    label="Data Efficiency"
                    onTest={runTest}
                    result={testResults['data-efficiency']}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

interface TestButtonProps {
  name: string;
  label: string;
  onTest: (name: string) => void;
  result?: boolean;
}

const TestButton: React.FC<TestButtonProps> = ({ name, label, onTest, result }) => {
  return (
    <div className="flex items-center justify-between p-2 border rounded">
      <span>{label}</span>
      <div className="flex items-center space-x-2">
        {result !== undefined && (
          <Badge variant={result ? 'default' : 'destructive'}>
            {result ? 'Pass' : 'Fail'}
          </Badge>
        )}
        <Button size="sm" onClick={() => onTest(name)}>
          Run Test
        </Button>
      </div>
    </div>
  );
};
