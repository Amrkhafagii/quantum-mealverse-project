
import React, { useState, useEffect } from 'react';
import { useResponsive } from '@/responsive/core/ResponsiveContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import SafeAreaView from '@/components/ui/SafeAreaView';

export const SafeAreaTester: React.FC = () => {
  const { isPlatformIOS, safeAreaTop, safeAreaBottom, safeAreaLeft, safeAreaRight } = useResponsive();
  const [showOverlay, setShowOverlay] = useState(false);
  const [testMode, setTestMode] = useState<'normal' | 'full' | 'inset'>('normal');

  const testCases = [
    { name: 'Normal SafeAreaView', mode: 'normal' as const },
    { name: 'Full Screen', mode: 'full' as const },
    { name: 'Inset SafeAreaView', mode: 'inset' as const }
  ];

  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-blue-500 to-purple-600">
      {/* Safe area visualization overlay */}
      {showOverlay && isPlatformIOS && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {/* Top safe area */}
          <div 
            className="absolute top-0 left-0 right-0 bg-red-500/30 border-b-2 border-red-500"
            style={{ height: `${safeAreaTop}px` }}
          >
            <div className="flex items-center justify-center h-full text-white text-xs font-bold">
              Safe Area Top: {safeAreaTop}px
            </div>
          </div>
          
          {/* Bottom safe area */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-red-500/30 border-t-2 border-red-500"
            style={{ height: `${safeAreaBottom}px` }}
          >
            <div className="flex items-center justify-center h-full text-white text-xs font-bold">
              Safe Area Bottom: {safeAreaBottom}px
            </div>
          </div>
          
          {/* Left safe area */}
          <div 
            className="absolute top-0 bottom-0 left-0 bg-red-500/30 border-r-2 border-red-500"
            style={{ width: `${safeAreaLeft}px` }}
          />
          
          {/* Right safe area */}
          <div 
            className="absolute top-0 bottom-0 right-0 bg-red-500/30 border-l-2 border-red-500"
            style={{ width: `${safeAreaRight}px` }}
          />
        </div>
      )}

      {/* Test content based on selected mode */}
      {testMode === 'normal' && (
        <SafeAreaView className="h-full flex flex-col">
          <div className="flex-1 p-4 space-y-4">
            <TestContent 
              showOverlay={showOverlay}
              setShowOverlay={setShowOverlay}
              testCases={testCases}
              currentMode={testMode}
              setTestMode={setTestMode}
            />
          </div>
        </SafeAreaView>
      )}

      {testMode === 'full' && (
        <div className="h-full flex flex-col p-4 space-y-4">
          <TestContent 
            showOverlay={showOverlay}
            setShowOverlay={setShowOverlay}
            testCases={testCases}
            currentMode={testMode}
            setTestMode={setTestMode}
          />
        </div>
      )}

      {testMode === 'inset' && (
        <SafeAreaView className="h-full flex flex-col" disableTop disableBottom>
          <div className="flex-1 p-4 space-y-4">
            <TestContent 
              showOverlay={showOverlay}
              setShowOverlay={setShowOverlay}
              testCases={testCases}
              currentMode={testMode}
              setTestMode={setTestMode}
            />
          </div>
        </SafeAreaView>
      )}
    </div>
  );
};

interface TestContentProps {
  showOverlay: boolean;
  setShowOverlay: (show: boolean) => void;
  testCases: Array<{ name: string; mode: 'normal' | 'full' | 'inset' }>;
  currentMode: 'normal' | 'full' | 'inset';
  setTestMode: (mode: 'normal' | 'full' | 'inset') => void;
}

const TestContent: React.FC<TestContentProps> = ({
  showOverlay,
  setShowOverlay,
  testCases,
  currentMode,
  setTestMode
}) => {
  const { isPlatformIOS, safeAreaTop, safeAreaBottom, safeAreaLeft, safeAreaRight } = useResponsive();

  return (
    <>
      <Card className="p-4 bg-white/90 backdrop-blur-sm">
        <h2 className="text-xl font-bold mb-4">Safe Area Testing</h2>
        
        {isPlatformIOS ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Top Safe Area:</span>
              <span className="font-mono">{safeAreaTop}px</span>
            </div>
            <div className="flex justify-between">
              <span>Bottom Safe Area:</span>
              <span className="font-mono">{safeAreaBottom}px</span>
            </div>
            <div className="flex justify-between">
              <span>Left Safe Area:</span>
              <span className="font-mono">{safeAreaLeft}px</span>
            </div>
            <div className="flex justify-between">
              <span>Right Safe Area:</span>
              <span className="font-mono">{safeAreaRight}px</span>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-600">
            Safe area testing is only available on iOS devices
          </div>
        )}
      </Card>

      <Card className="p-4 bg-white/90 backdrop-blur-sm">
        <h3 className="text-lg font-semibold mb-3">Test Modes</h3>
        <div className="grid gap-2">
          {testCases.map((testCase) => (
            <Button
              key={testCase.mode}
              variant={currentMode === testCase.mode ? "default" : "outline"}
              onClick={() => setTestMode(testCase.mode)}
              className="justify-start"
            >
              {testCase.name}
              {currentMode === testCase.mode && (
                <span className="ml-2 text-xs">(Active)</span>
              )}
            </Button>
          ))}
        </div>
      </Card>

      {isPlatformIOS && (
        <Card className="p-4 bg-white/90 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-3">Visualization</h3>
          <Button
            variant={showOverlay ? "default" : "outline"}
            onClick={() => setShowOverlay(!showOverlay)}
            className="w-full"
          >
            {showOverlay ? 'Hide' : 'Show'} Safe Area Overlay
          </Button>
        </Card>
      )}

      {/* Corner test elements */}
      <div className="absolute top-4 left-4 w-12 h-12 bg-yellow-500 rounded flex items-center justify-center text-xs font-bold">
        TL
      </div>
      <div className="absolute top-4 right-4 w-12 h-12 bg-yellow-500 rounded flex items-center justify-center text-xs font-bold">
        TR
      </div>
      <div className="absolute bottom-4 left-4 w-12 h-12 bg-yellow-500 rounded flex items-center justify-center text-xs font-bold">
        BL
      </div>
      <div className="absolute bottom-4 right-4 w-12 h-12 bg-yellow-500 rounded flex items-center justify-center text-xs font-bold">
        BR
      </div>
    </>
  );
};
