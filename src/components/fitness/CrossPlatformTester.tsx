import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useResponsive } from '@/responsive/core';
import { useDeviceOrientation } from '@/responsive/core/hooks';
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
  Info
} from 'lucide-react';

interface ScreenTestResult {
  width: number;
  height: number;
  orientation: string;
  platform: string;
  passed: boolean;
  issues: string[];
}

export const CrossPlatformTester: React.FC = () => {
  const { 
    isMobile, 
    isTablet, 
    isDesktop, 
    isPlatformIOS, 
    isPlatformAndroid, 
    isPlatformWeb,
    isInitialized 
  } = useResponsive();
  
  const { orientation, isPortrait, isLandscape } = useDeviceOrientation();
  const [testResults, setTestResults] = useState<ScreenTestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [currentDimensions, setCurrentDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Screen size breakpoints to test
  const testBreakpoints = [
    { name: 'Small Phone', width: 320, height: 568 },
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'Android Small', width: 360, height: 640 },
    { name: 'Tablet Portrait', width: 768, height: 1024 },
    { name: 'Tablet Landscape', width: 1024, height: 768 },
    { name: 'Desktop Small', width: 1280, height: 720 },
    { name: 'Desktop Large', width: 1920, height: 1080 },
  ];

  useEffect(() => {
    const handleResize = () => {
      setCurrentDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    const handleOrientationChange = () => {
      // Small delay to ensure dimensions are updated
      setTimeout(() => {
        setCurrentDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  const runResponsivenessTest = () => {
    setIsRunningTests(true);
    const results: ScreenTestResult[] = [];
    
    // Test current screen
    const currentResult = testCurrentScreen();
    results.push(currentResult);
    
    setTestResults(results);
    setIsRunningTests(false);
  };

  const testCurrentScreen = (): ScreenTestResult => {
    const issues: string[] = [];
    
    // Test minimum touch target sizes
    const buttons = document.querySelectorAll('button');
    buttons.forEach((button) => {
      const rect = button.getBoundingClientRect();
      if (rect.height < 44 && isMobile) {
        issues.push(`Button too small: ${rect.height}px height (min 44px for iOS)`);
      }
    });

    // Test text readability
    const textElements = document.querySelectorAll('p, span, div');
    textElements.forEach((element) => {
      const style = window.getComputedStyle(element);
      const fontSize = parseFloat(style.fontSize);
      if (fontSize < 16 && isMobile) {
        issues.push(`Text too small: ${fontSize}px (min 16px for mobile)`);
      }
    });

    // Test horizontal scrolling
    const hasHorizontalScroll = document.body.scrollWidth > window.innerWidth;
    if (hasHorizontalScroll) {
      issues.push('Horizontal scrolling detected');
    }

    // Test safe area handling on iOS
    if (isPlatformIOS) {
      const safeAreaElements = document.querySelectorAll('.pt-safe, .pb-safe');
      if (safeAreaElements.length === 0) {
        issues.push('No safe area padding detected on iOS');
      }
    }

    return {
      width: currentDimensions.width,
      height: currentDimensions.height,
      orientation: isLandscape ? 'landscape' : 'portrait',
      platform: isPlatformIOS ? 'iOS' : isPlatformAndroid ? 'Android' : 'Web',
      passed: issues.length === 0,
      issues
    };
  };

  const getPlatformIcon = () => {
    if (isMobile) return <Smartphone className="h-4 w-4" />;
    if (isTablet) return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const getPlatformBadgeColor = () => {
    if (isPlatformIOS) return 'bg-blue-500';
    if (isPlatformAndroid) return 'bg-green-500';
    return 'bg-gray-500';
  };

  if (!isInitialized) {
    return <div>Loading platform detection...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Current Platform Info */}
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-quantum-cyan">
            <TestTube className="h-5 w-5" />
            Cross-Platform Testing Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              {getPlatformIcon()}
              <span className="text-sm">
                {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={getPlatformBadgeColor()}>
                {isPlatformIOS ? 'iOS' : isPlatformAndroid ? 'Android' : 'Web'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              <span className="text-sm capitalize">{orientation}</span>
            </div>
            
            <div className="text-sm">
              {currentDimensions.width} × {currentDimensions.height}
            </div>
          </div>

          <Button 
            onClick={runResponsivenessTest}
            disabled={isRunningTests}
            className="w-full sm:w-auto"
          >
            {isRunningTests ? 'Running Tests...' : 'Run Responsiveness Test'}
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader>
            <CardTitle className="text-quantum-cyan">Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            {testResults.map((result, index) => (
              <div key={index} className="border border-gray-600 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={result.passed ? "default" : "destructive"}>
                      {result.passed ? 'PASS' : 'FAIL'}
                    </Badge>
                    <span className="text-sm">
                      {result.platform} - {result.width}×{result.height} ({result.orientation})
                    </span>
                  </div>
                </div>
                
                {result.issues.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-400 mb-1">Issues Found:</p>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {result.issues.map((issue, issueIndex) => (
                        <li key={issueIndex} className="flex items-start gap-2">
                          <span className="text-red-400">•</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Breakpoint Reference */}
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="text-quantum-cyan">Screen Size Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {testBreakpoints.map((bp, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                <span className="text-sm font-medium">{bp.name}</span>
                <span className="text-xs text-gray-400">
                  {bp.width}×{bp.height}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Indicators */}
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="text-quantum-cyan">Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-green-400" />
              <span className="text-sm">Network: Online</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Battery className="h-4 w-4 text-yellow-400" />
              <span className="text-sm">
                Battery: {(navigator as any).getBattery ? 'Available' : 'N/A'}
              </span>
            </div>
            
            <div className="text-sm">
              Viewport: {window.visualViewport?.height || 'N/A'}px
            </div>
            
            <div className="text-sm">
              Pixel Ratio: {window.devicePixelRatio}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CrossPlatformTester;
