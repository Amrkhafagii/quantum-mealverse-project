
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Platform } from '@/utils/platform';

interface PerformanceMetrics {
  fps: number;
  memory: {
    used: number;
    total: number;
    limit: number;
  } | null;
  renderTime: number;
  loadTime: number;
  deviceScore: number;
  networkSpeed: string;
  batteryLevel: number | null;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memory: null,
    renderTime: 0,
    loadTime: 0,
    deviceScore: 0,
    networkSpeed: 'unknown',
    batteryLevel: null
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [stressTest, setStressTest] = useState(false);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationRef = useRef<number>();
  const stressElements = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (isMonitoring) {
      startMonitoring();
    } else {
      stopMonitoring();
    }

    return () => stopMonitoring();
  }, [isMonitoring]);

  useEffect(() => {
    // Initial device assessment
    assessDevice();
    measureLoadTime();
    getBatteryInfo();
  }, []);

  const startMonitoring = () => {
    const measureFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime.current >= 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round(frameCount.current * 1000 / (currentTime - lastTime.current))
        }));
        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      // Measure memory if available
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memory: {
            used: Math.round(memInfo.usedJSHeapSize / 1024 / 1024),
            total: Math.round(memInfo.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024)
          }
        }));
      }

      // Measure render time
      const renderStart = performance.now();
      requestAnimationFrame(() => {
        const renderEnd = performance.now();
        setMetrics(prev => ({
          ...prev,
          renderTime: renderEnd - renderStart
        }));
      });

      if (isMonitoring) {
        animationRef.current = requestAnimationFrame(measureFPS);
      }
    };

    measureFPS();
  };

  const stopMonitoring = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const assessDevice = () => {
    let score = 100;
    
    // CPU assessment
    const cores = navigator.hardwareConcurrency || 1;
    if (cores < 2) score -= 30;
    else if (cores < 4) score -= 15;
    
    // Memory assessment
    const deviceMemory = (navigator as any).deviceMemory;
    if (deviceMemory) {
      if (deviceMemory < 2) score -= 20;
      else if (deviceMemory < 4) score -= 10;
    }
    
    // Connection assessment
    const connection = (navigator as any).connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      setMetrics(prev => ({ ...prev, networkSpeed: effectiveType }));
      
      if (effectiveType === 'slow-2g' || effectiveType === '2g') score -= 25;
      else if (effectiveType === '3g') score -= 15;
    }
    
    setMetrics(prev => ({ ...prev, deviceScore: Math.max(0, score) }));
  };

  const measureLoadTime = () => {
    const loadTime = performance.timing?.loadEventEnd - performance.timing?.navigationStart;
    if (loadTime > 0) {
      setMetrics(prev => ({ ...prev, loadTime: loadTime }));
    }
  };

  const getBatteryInfo = async () => {
    if ('getBattery' in navigator) {
      try {
        const battery = await (navigator as any).getBattery();
        setMetrics(prev => ({
          ...prev,
          batteryLevel: Math.round(battery.level * 100)
        }));
      } catch (error) {
        console.log('Battery API not available');
      }
    }
  };

  const runStressTest = () => {
    setStressTest(true);
    
    // Create many animated elements
    const container = document.getElementById('stress-container');
    if (container) {
      stressElements.current = [];
      
      for (let i = 0; i < 100; i++) {
        const element = document.createElement('div');
        element.className = 'w-4 h-4 bg-red-500 absolute rounded-full animate-bounce';
        element.style.left = Math.random() * 300 + 'px';
        element.style.top = Math.random() * 300 + 'px';
        element.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(element);
        stressElements.current.push(element);
      }
    }

    setTimeout(() => {
      setStressTest(false);
      stressElements.current.forEach(el => el.remove());
      stressElements.current = [];
    }, 5000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-600';
    if (fps >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Performance Monitor</h2>
        <div className="flex gap-2">
          <Button
            variant={isMonitoring ? "destructive" : "default"}
            onClick={() => setIsMonitoring(!isMonitoring)}
          >
            {isMonitoring ? 'Stop' : 'Start'} Monitoring
          </Button>
          <Button
            variant="outline"
            onClick={runStressTest}
            disabled={stressTest}
          >
            {stressTest ? 'Running...' : 'Stress Test'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* FPS Monitor */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Frame Rate</h3>
          <div className={cn("text-3xl font-bold mb-2", getFPSColor(metrics.fps))}>
            {metrics.fps} FPS
          </div>
          <Progress value={Math.min(metrics.fps, 60)} className="mb-2" />
          <p className="text-sm text-gray-600">
            Target: 60 FPS for smooth animations
          </p>
        </Card>

        {/* Memory Usage */}
        {metrics.memory && (
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">Memory Usage</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Used:</span>
                <span className="font-mono">{metrics.memory.used} MB</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-mono">{metrics.memory.total} MB</span>
              </div>
              <Progress 
                value={(metrics.memory.used / metrics.memory.limit) * 100} 
                className="mt-2"
              />
            </div>
          </Card>
        )}

        {/* Device Score */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Device Score</h3>
          <div className={cn("text-3xl font-bold mb-2", getScoreColor(metrics.deviceScore))}>
            {metrics.deviceScore}/100
          </div>
          <Progress value={metrics.deviceScore} className="mb-2" />
          <div className="text-sm space-y-1">
            <div>Cores: {navigator.hardwareConcurrency || 'Unknown'}</div>
            <div>RAM: {(navigator as any).deviceMemory || 'Unknown'} GB</div>
            <div>Network: {metrics.networkSpeed}</div>
          </div>
        </Card>

        {/* Render Performance */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Render Time</h3>
          <div className="text-2xl font-bold mb-2">
            {metrics.renderTime.toFixed(2)}ms
          </div>
          <div className="text-sm text-gray-600">
            Per frame render time
          </div>
        </Card>

        {/* Load Time */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Load Time</h3>
          <div className="text-2xl font-bold mb-2">
            {(metrics.loadTime / 1000).toFixed(2)}s
          </div>
          <div className="text-sm text-gray-600">
            Initial page load time
          </div>
        </Card>

        {/* Battery Level */}
        {metrics.batteryLevel !== null && (
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-2">Battery Level</h3>
            <div className="text-2xl font-bold mb-2">
              {metrics.batteryLevel}%
            </div>
            <Progress value={metrics.batteryLevel} className="mb-2" />
            <div className="text-sm text-gray-600">
              Current battery level
            </div>
          </Card>
        )}
      </div>

      {/* Platform Info */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Platform Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Platform:</span>
            <br />
            {Platform.getPlatformName()}
          </div>
          <div>
            <span className="font-medium">Native:</span>
            <br />
            {Platform.isNative() ? 'Yes' : 'No'}
          </div>
          <div>
            <span className="font-medium">Low-end Device:</span>
            <br />
            {Platform.isLowEndDevice() ? 'Yes' : 'No'}
          </div>
          <div>
            <span className="font-medium">User Agent:</span>
            <br />
            <span className="text-xs break-words">
              {navigator.userAgent.substring(0, 50)}...
            </span>
          </div>
        </div>
      </Card>

      {/* Stress Test Container */}
      <div
        id="stress-container"
        className="relative h-64 bg-gray-100 rounded border-2 border-dashed border-gray-300 overflow-hidden"
      >
        <div className="flex items-center justify-center h-full text-gray-500">
          {stressTest ? 'Stress Test Running...' : 'Stress Test Area'}
        </div>
      </div>
    </div>
  );
};
