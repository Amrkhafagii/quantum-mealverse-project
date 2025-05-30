
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Settings, User, Mail, Layout, LayoutGrid } from 'lucide-react';
import PlatformContainer from '@/components/layout/PlatformContainer';
import PlatformLayout from '@/components/layout/PlatformLayout';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import { Platform } from '@/utils/platform';

const PlatformLayoutDemo = () => {
  const [activeLayout, setActiveLayout] = useState<'auto' | 'stack' | 'tabs' | 'split' | 'tabBar'>('auto');
  const [activeSection, setActiveSection] = useState('home');
  const { orientation } = useDeviceOrientation();
  const isMobile = Platform.isMobile();
  
  const sections = [
    {
      id: 'home',
      title: 'Home',
      icon: <Home className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Home Content</h2>
          <p>This is the main content area that adapts to different layout modes.</p>
          
          <Card>
            <CardHeader>
              <CardTitle>Platform-Specific Layout</CardTitle>
              <CardDescription>
                This layout adapts to different platforms and orientations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Current platform: <strong>{Platform.isIOS() ? 'iOS' : Platform.isAndroid() ? 'Android' : 'Web'}</strong><br />
                Current orientation: <strong>{orientation}</strong><br />
                Layout mode: <strong>{activeLayout}</strong>
              </p>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Feature One</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Demo content for feature one.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Feature Two</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Demo content for feature two.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: <User className="h-5 w-5" />,
      content: (
        <div>
          <h2 className="text-xl font-bold mb-4">User Profile</h2>
          <div className="flex flex-col items-center mb-6">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full w-24 h-24 flex items-center justify-center mb-3">
              <User className="h-12 w-12 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-medium">John Doe</h3>
            <p className="text-sm text-muted-foreground">john@example.com</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span>Account Settings</span>
              <Settings className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span>Notifications</span>
              <Mail className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span>Display Options</span>
              <Layout className="h-4 w-4" />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      content: (
        <div>
          <h2 className="text-xl font-bold mb-4">Settings</h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-base font-medium">Display</h3>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>Dark Mode</span>
                <div className="w-12 h-6 bg-gray-200 dark:bg-gray-800 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>Reduce Motion</span>
                <div className="w-12 h-6 bg-gray-200 dark:bg-gray-800 rounded-full relative">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base font-medium">Notifications</h3>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>Push Notifications</span>
                <div className="w-12 h-6 bg-green-500 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <span>Email Alerts</span>
                <div className="w-12 h-6 bg-green-500 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'layout',
      title: 'Layout',
      icon: <LayoutGrid className="h-5 w-5" />,
      content: (
        <div>
          <h2 className="text-xl font-bold mb-4">Layout Options</h2>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose a layout mode. 'Auto' will select the best layout based on your device.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Button 
                variant={activeLayout === 'auto' ? 'default' : 'outline'} 
                onClick={() => setActiveLayout('auto')}
                className="justify-start"
              >
                <Layout className="h-4 w-4 mr-2" />
                Auto
              </Button>
              <Button 
                variant={activeLayout === 'stack' ? 'default' : 'outline'} 
                onClick={() => setActiveLayout('stack')}
                className="justify-start"
              >
                <Layout className="h-4 w-4 mr-2" />
                Stack
              </Button>
              <Button 
                variant={activeLayout === 'tabs' ? 'default' : 'outline'} 
                onClick={() => setActiveLayout('tabs')}
                className="justify-start"
              >
                <Layout className="h-4 w-4 mr-2" />
                Tabs
              </Button>
              <Button 
                variant={activeLayout === 'split' ? 'default' : 'outline'} 
                onClick={() => setActiveLayout('split')}
                className="justify-start"
              >
                <Layout className="h-4 w-4 mr-2" />
                Split
              </Button>
              <Button 
                variant={activeLayout === 'tabBar' ? 'default' : 'outline'} 
                onClick={() => setActiveLayout('tabBar')}
                className="justify-start"
              >
                <Layout className="h-4 w-4 mr-2" />
                Tab Bar
              </Button>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Platform Layout Demo</h1>
      
      <Tabs defaultValue="demo" className="mb-8">
        <TabsList>
          <TabsTrigger value="demo">Demo</TabsTrigger>
          <TabsTrigger value="info">About</TabsTrigger>
        </TabsList>
        
        <TabsContent value="demo" className="pt-4">
          <PlatformContainer>
            <PlatformLayout
              layoutType={activeLayout}
              defaultActive="home" 
              onActiveChange={setActiveSection}
              className="border rounded-lg overflow-hidden"
              sections={sections.map(section => ({
                id: section.id,
                title: section.title,
                icon: section.icon,
                content: (
                  <div className="p-4">
                    {section.content}
                  </div>
                )
              }))}
            />
          </PlatformContainer>
        </TabsContent>
        
        <TabsContent value="info" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>About Platform Layouts</CardTitle>
              <CardDescription>
                Adaptive layouts that follow platform conventions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Platform Layout components provide a consistent way to adapt your UI to different platforms and screen sizes.
                Each layout mode is optimized for specific contexts:
              </p>
              
              <ul className="space-y-2">
                <li><strong>Auto:</strong> Automatically selects the best layout based on platform and screen size.</li>
                <li><strong>Stack:</strong> Simple stacked navigation ideal for mobile in portrait mode.</li>
                <li><strong>Tabs:</strong> Horizontal tab navigation good for desktop and tablet.</li>
                <li><strong>Split:</strong> Two-panel layout ideal for tablets and desktop.</li>
                <li><strong>Tab Bar:</strong> Bottom tab bar navigation following iOS/Android conventions.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformLayoutDemo;
