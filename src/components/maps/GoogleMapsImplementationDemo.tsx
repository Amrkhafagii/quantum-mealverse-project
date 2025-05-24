
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Coffee } from 'lucide-react';
import BatteryEfficientTracker from '@/components/delivery/BatteryEfficientTracker';
import { useMapService } from '@/contexts/MapServiceContext';

const GoogleMapsImplementationDemo = () => {
  const { performanceLevel } = useMapService();
  const [activePhase, setActivePhase] = useState('phase1');
  const [progress, setProgress] = useState({
    phase1: 100, // Complete
    phase2: 35,  // In progress
    phase3: 70,  // In progress
    phase4: 20,  // Just started
    phase5: 0    // Not started
  });

  // Simulate progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => ({
        ...prev,
        phase2: Math.min(prev.phase2 + 1, 100),
        phase3: Math.min(prev.phase3 + 0.5, 100),
        phase4: Math.min(prev.phase4 + 0.2, 100)
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Google Maps Migration Status</CardTitle>
          <Badge variant={performanceLevel === 'high' ? 'default' : performanceLevel === 'medium' ? 'secondary' : 'destructive'}>
            {performanceLevel} performance
          </Badge>
        </div>
        <CardDescription>
          Current implementation status with real-time components
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="phase1" value={activePhase} onValueChange={setActivePhase}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="phase1">Phase 1</TabsTrigger>
            <TabsTrigger value="phase2">Phase 2</TabsTrigger>
            <TabsTrigger value="phase3">Phase 3</TabsTrigger>
            <TabsTrigger value="phase4">Phase 4</TabsTrigger>
            <TabsTrigger value="phase5">Phase 5</TabsTrigger>
          </TabsList>
          
          <TabsContent value="phase1" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Fix Build Errors & Stability</h3>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <Progress value={progress.phase1} className="h-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Completed Tasks:</h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Fixed TypeScript errors in hooks
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Corrected Icon type implementation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Ensured consistent interface usage
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
                <h4 className="text-sm font-medium mb-2">Battery Efficient Tracker Demo</h4>
                <BatteryEfficientTracker />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="phase2" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">API Integration Standardization</h3>
              <Coffee className="h-5 w-5 text-yellow-500" />
            </div>
            <Progress value={progress.phase2} className="h-2" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Pending Tasks:</h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                    Consolidate API key management
                  </li>
                  <li className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                    Implement consistent error handling
                  </li>
                  <li className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                    Develop centralized retry logic
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
                <h4 className="text-sm font-medium mb-2">Work in progress</h4>
                <p className="text-sm text-muted-foreground">API integration standardization is currently in development.</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="phase3" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Performance Optimization</h3>
              <Coffee className="h-5 w-5 text-yellow-500" />
            </div>
            <Progress value={progress.phase3} className="h-2" />
            
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
              <h4 className="text-sm font-medium mb-2">Progress Notes</h4>
              <p className="text-sm text-muted-foreground">
                Performance optimization is partially implemented with battery-efficient tracking
                and dynamic precision adjustments based on device capabilities.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="phase4" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Mobile-Desktop Standardization</h3>
              <Coffee className="h-5 w-5 text-yellow-500" />
            </div>
            <Progress value={progress.phase4} className="h-2" />
            
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
              <h4 className="text-sm font-medium mb-2">Progress Notes</h4>
              <p className="text-sm text-muted-foreground">
                Mobile-desktop standardization has begun with responsive components
                and platform detection capabilities.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="phase5" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Testing & Validation</h3>
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <Progress value={progress.phase5} className="h-2" />
            
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-md">
              <h4 className="text-sm font-medium mb-2">Not Started</h4>
              <p className="text-sm text-muted-foreground">
                The testing and validation phase will begin after the implementation
                of the previous phases.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GoogleMapsImplementationDemo;
