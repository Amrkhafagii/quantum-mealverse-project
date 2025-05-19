
import React, { useState } from 'react';
import { PlatformContainer } from '@/components/layout/PlatformContainer';
import { PlatformLayout } from '@/components/layout/PlatformLayout';
import { PlatformNavigationBar } from '@/components/layout/PlatformNavigationBar';
import { ScreenTransition } from '@/components/layout/ScreenTransition';
import { AdaptiveGrid } from '@/components/ui/adaptive-grid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  LayoutList, 
  LayoutDashboard, 
  Settings 
} from 'lucide-react';
import { useResponsive } from '@/contexts/ResponsiveContext';

const PlatformLayoutDemo = () => {
  const navigate = useNavigate();
  const { isPlatformIOS, isPlatformAndroid, isMobile } = useResponsive();
  const [layoutType, setLayoutType] = useState<'auto' | 'stack' | 'split' | 'tabs' | 'tabBar'>('auto');
  const [activeScreen, setActiveScreen] = useState('grid');
  const [selectedVariant, setSelectedVariant] = useState('elevated');
  const [useSafeArea, setUseSafeArea] = useState(true);
  
  // Example data for each section
  const gridContent = (
    <ScrollArea className="h-full p-4">
      <h2 className="text-2xl font-bold mb-4">Grid Examples</h2>
      
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-2">Basic Grid (2 columns on mobile, 3 on tablet, 4 on desktop)</h3>
          <AdaptiveGrid 
            columns={{ mobile: 2, tablet: 3, desktop: 4 }}
            gap="md"
            className="mb-8"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="aspect-square bg-muted/50 rounded flex items-center justify-center">
                    Item {i+1}
                  </div>
                </CardContent>
              </Card>
            ))}
          </AdaptiveGrid>
        </div>
      
        <div>
          <h3 className="text-lg font-medium mb-2">Masonry Grid</h3>
          <AdaptiveGrid 
            columns={{ mobile: 2, tablet: 3, desktop: 3 }}
            gap="md"
            masonry
            className="mb-8"
          >
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i} className={i % 3 === 0 ? 'h-64' : i % 3 === 1 ? 'h-48' : 'h-72'}>
                <CardContent className="p-4 h-full">
                  <div className="h-full bg-muted/50 rounded flex items-center justify-center">
                    Masonry Item {i+1}
                  </div>
                </CardContent>
              </Card>
            ))}
          </AdaptiveGrid>
        </div>
      </div>
    </ScrollArea>
  );
  
  const listContent = (
    <ScrollArea className="h-full p-4">
      <h2 className="text-2xl font-bold mb-4">Platform Container Examples</h2>
      
      <div className="space-y-6">
        <PlatformContainer variant="default" padding="md" className="mb-4">
          <CardTitle>Default Container</CardTitle>
          <CardDescription>Simple container with default styling</CardDescription>
        </PlatformContainer>
        
        <PlatformContainer variant="elevated" padding="md" className="mb-4">
          <CardTitle>Elevated Container</CardTitle>
          <CardDescription>Container with elevation styling (shadows)</CardDescription>
        </PlatformContainer>
        
        <PlatformContainer variant="outlined" padding="md" className="mb-4">
          <CardTitle>Outlined Container</CardTitle>
          <CardDescription>Container with border styling</CardDescription>
        </PlatformContainer>
      </div>
    </ScrollArea>
  );
  
  const dashboardContent = (
    <ScrollArea className="h-full p-4">
      <h2 className="text-2xl font-bold mb-4">Navigation Examples</h2>
      
      <div className="space-y-6">
        <div className="border rounded-lg overflow-hidden">
          <PlatformNavigationBar 
            title="Platform Navigation"
            subtitle="iOS and Android styling"
            onBack={() => {}}
            actions={
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            }
            elevated
          />
          <div className="p-4">
            <p>Navigation bar adapts to platform-specific styles</p>
          </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <PlatformNavigationBar 
            title="iOS Style"
            subtitle="With large title option"
            onBack={() => {}}
            largeTitle={isPlatformIOS}
          />
          <div className="p-4">
            <p>iOS navigation with large title option</p>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
  
  const settingsContent = (
    <ScrollArea className="h-full p-4">
      <h2 className="text-2xl font-bold mb-4">Layout Settings</h2>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Layout Configuration</CardTitle>
            <CardDescription>Customize the layout behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="layout-type">Layout Type</Label>
              <select 
                id="layout-type"
                value={layoutType}
                onChange={(e) => setLayoutType(e.target.value as any)}
                className="border rounded p-1"
              >
                <option value="auto">Auto (Based on Device)</option>
                <option value="stack">Stacked</option>
                <option value="split">Split View</option>
                <option value="tabs">Tabs</option>
                <option value="tabBar">Tab Bar</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="container-variant">Container Variant</Label>
              <select 
                id="container-variant"
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className="border rounded p-1"
              >
                <option value="default">Default</option>
                <option value="elevated">Elevated</option>
                <option value="outlined">Outlined</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="safe-area">Use Safe Area</Label>
              <Switch 
                id="safe-area"
                checked={useSafeArea}
                onCheckedChange={setUseSafeArea}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="default"
              onClick={() => navigate('/')}
            >
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    </ScrollArea>
  );
  
  // Define the layout sections
  const sections = [
    { id: 'grid', title: 'Grid', icon: <LayoutGrid className="h-5 w-5" />, content: gridContent },
    { id: 'list', title: 'Containers', icon: <LayoutList className="h-5 w-5" />, content: listContent },
    { id: 'dashboard', title: 'Navigation', icon: <LayoutDashboard className="h-5 w-5" />, content: dashboardContent },
    { id: 'settings', title: 'Settings', icon: <Settings className="h-5 w-5" />, content: settingsContent }
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <PlatformNavigationBar
        title="Platform UI Components"
        subtitle="Adaptive Layout Demo"
        onBack={() => navigate('/')}
        actions={
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              const nextIndex = (sections.findIndex(s => s.id === activeScreen) + 1) % sections.length;
              setActiveScreen(sections[nextIndex].id);
            }}
          >
            <Settings className="h-5 w-5" />
          </Button>
        }
      />
      
      <div className="flex-1 overflow-hidden">
        <PlatformContainer
          variant={selectedVariant as any}
          safeArea={useSafeArea}
          fullHeight
          className="h-full"
        >
          <ScreenTransition identifier={activeScreen} type="platform">
            <PlatformLayout
              sections={sections}
              layoutType={layoutType}
              defaultActive={activeScreen}
              onSectionChange={setActiveScreen}
              className="h-full"
            />
          </ScreenTransition>
        </PlatformContainer>
      </div>
    </div>
  );
};

export default PlatformLayoutDemo;
