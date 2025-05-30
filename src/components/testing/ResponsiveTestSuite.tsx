import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useResponsive } from '@/responsive/core';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Smartphone, 
  Monitor, 
  Tablet, 
  RotateCcw, 
  Cpu, 
  Wifi,
  CheckCircle2,
  AlertTriangle,
  Info,
  Eye,
  Layout
} from 'lucide-react';

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

export const ResponsiveTestSuite: React.FC = () => {
  const responsive = useResponsive();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentOrientation, setCurrentOrientation] = useState<string>('portrait');
  const [performanceMetrics, setPerformanceMetrics] = useState<any>({});

  useEffect(() => {
    runTests();
    measurePerformance();
    
    const handleOrientationChange = () => {
      setTimeout(() => {
        setCurrentOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
        runTests();
      }, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  const runTests = () => {
    const results: TestResult[] = [];

    // Screen size tests
    results.push({
      test: 'Mobile Detection',
      status: responsive.isMobile === (window.innerWidth < 768) ? 'pass' : 'fail',
      message: `Detected: ${responsive.isMobile ? 'Mobile' : 'Desktop'}, Width: ${window.innerWidth}px`
    });

    results.push({
      test: 'Tablet Detection',
      status: responsive.isTablet === (window.innerWidth >= 768 && window.innerWidth < 1024) ? 'pass' : 'fail',
      message: `Detected: ${responsive.isTablet ? 'Tablet' : 'Not Tablet'}, Width: ${window.innerWidth}px`
    });

    // Safe area tests (iOS specific)
    if (responsive.isPlatformIOS) {
      results.push({
        test: 'Safe Area Top',
        status: responsive.safeAreaTop >= 0 ? 'pass' : 'fail',
        message: `Top: ${responsive.safeAreaTop}px`
      });

      results.push({
        test: 'Safe Area Bottom',
        status: responsive.safeAreaBottom >= 0 ? 'pass' : 'fail',
        message: `Bottom: ${responsive.safeAreaBottom}px`
      });

      results.push({
        test: 'Notch Detection',
        status: responsive.hasNotch ? 'warning' : 'pass',
        message: `Notch detected: ${responsive.hasNotch}`
      });

      results.push({
        test: 'Dynamic Island Detection',
        status: responsive.hasDynamicIsland ? 'warning' : 'pass',
        message: `Dynamic Island: ${responsive.hasDynamicIsland}`
      });
    }

    // Platform detection tests
    results.push({
      test: 'Platform Detection',
      status: 'pass',
      message: `Platform: ${Platform.getPlatformName()}, Native: ${Platform.isNative()}`
    });

    // Orientation tests
    results.push({
      test: 'Orientation Detection',
      status: responsive.isLandscape === (window.innerWidth > window.innerHeight) ? 'pass' : 'fail',
      message: `Current: ${currentOrientation}, Detected: ${responsive.isLandscape ? 'landscape' : 'portrait'}`
    });

    // Touch capability tests
    if (responsive.isMobile) {
      results.push({
        test: 'Touch Events',
        status: 'ontouchstart' in window ? 'pass' : 'fail',
        message: `Touch events supported: ${'ontouchstart' in window}`
      });
    }

    setTestResults(results);
  };

  const measurePerformance = () => {
    const metrics: any = {};
    
    // Memory usage (if available)
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      metrics.memory = {
        used: Math.round(memInfo.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memInfo.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024)
      };
    }

    // Device capabilities
    metrics.hardware = {
      cores: navigator.hardwareConcurrency || 'unknown',
      memory: (navigator as any).deviceMemory || 'unknown',
      connection: (navigator as any).connection?.effectiveType || 'unknown'
    };

    // Render performance
    const renderStart = performance.now();
    requestAnimationFrame(() => {
      metrics.renderTime = performance.now() - renderStart;
      setPerformanceMetrics(metrics);
    });
  };

  const simulateScreenSize = (width: number, height: number) => {
    // This would typically be used in a development environment
    console.log(`Simulating screen size: ${width}x${height}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800';
      case 'fail': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Responsive Test Suite</h2>
        <Button onClick={runTests} variant="outline">
          Run Tests
        </Button>
      </div>

      <Tabs defaultValue="responsive" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="responsive">Responsive</TabsTrigger>
          <TabsTrigger value="platform">Platform</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
        </TabsList>

        <TabsContent value="responsive" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Current Device Info</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Screen:</span>
                <br />
                {window.innerWidth} × {window.innerHeight}
              </div>
              <div>
                <span className="font-medium">Type:</span>
                <br />
                {responsive.isMobile ? 'Mobile' : responsive.isTablet ? 'Tablet' : 'Desktop'}
              </div>
              <div>
                <span className="font-medium">Orientation:</span>
                <br />
                {currentOrientation}
              </div>
              <div>
                <span className="font-medium">Pixel Ratio:</span>
                <br />
                {window.devicePixelRatio}
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Test Results</h3>
            <div className="space-y-2">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <span className="font-medium">{result.test}</span>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(result.status)}>
                      {result.status}
                    </Badge>
                    <span className="text-sm text-gray-600">{result.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="platform" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Platform Detection</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Basic Detection</h4>
                <div className="text-sm space-y-1">
                  <div>iOS: {responsive.isPlatformIOS ? '✅' : '❌'}</div>
                  <div>Android: {responsive.isPlatformAndroid ? '✅' : '❌'}</div>
                  <div>Web: {responsive.isPlatformWeb ? '✅' : '❌'}</div>
                  <div>Native: {Platform.isNative() ? '✅' : '❌'}</div>
                </div>
              </div>
              
              {responsive.isPlatformIOS && (
                <div className="space-y-2">
                  <h4 className="font-medium">iOS Specific</h4>
                  <div className="text-sm space-y-1">
                    <div>Safe Area Top: {responsive.safeAreaTop}px</div>
                    <div>Safe Area Bottom: {responsive.safeAreaBottom}px</div>
                    <div>Has Notch: {responsive.hasNotch ? '✅' : '❌'}</div>
                    <div>Dynamic Island: {responsive.hasDynamicIsland ? '✅' : '❌'}</div>
                    <div>Status Bar: {responsive.statusBarHeight}px</div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {performanceMetrics.memory && (
                <div className="space-y-2">
                  <h4 className="font-medium">Memory Usage</h4>
                  <div className="text-sm space-y-1">
                    <div>Used: {performanceMetrics.memory.used} MB</div>
                    <div>Total: {performanceMetrics.memory.total} MB</div>
                    <div>Limit: {performanceMetrics.memory.limit} MB</div>
                  </div>
                </div>
              )}
              
              {performanceMetrics.hardware && (
                <div className="space-y-2">
                  <h4 className="font-medium">Hardware</h4>
                  <div className="text-sm space-y-1">
                    <div>CPU Cores: {performanceMetrics.hardware.cores}</div>
                    <div>Device Memory: {performanceMetrics.hardware.memory} GB</div>
                    <div>Network: {performanceMetrics.hardware.connection}</div>
                  </div>
                </div>
              )}
            </div>
            
            {performanceMetrics.renderTime && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Render Performance</h4>
                <div className="text-sm">
                  Frame Time: {performanceMetrics.renderTime.toFixed(2)}ms
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="simulation" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Screen Size Simulation</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { name: 'iPhone SE', width: 375, height: 667 },
                { name: 'iPhone 12', width: 390, height: 844 },
                { name: 'iPhone 12 Pro Max', width: 428, height: 926 },
                { name: 'iPad', width: 768, height: 1024 },
                { name: 'iPad Pro', width: 1024, height: 1366 },
                { name: 'Desktop', width: 1920, height: 1080 }
              ].map((device) => (
                <Button
                  key={device.name}
                  variant="outline"
                  size="sm"
                  onClick={() => simulateScreenSize(device.width, device.height)}
                  className="text-xs"
                >
                  {device.name}
                  <br />
                  {device.width}×{device.height}
                </Button>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <strong>Note:</strong> Screen simulation requires development tools or browser developer mode to resize the viewport.
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
