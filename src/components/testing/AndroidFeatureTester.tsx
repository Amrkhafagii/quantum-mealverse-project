
import React, { useState, useEffect } from 'react';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Platform } from '@/utils/platform';
import { hapticFeedback } from '@/utils/hapticFeedback';

export const AndroidFeatureTester: React.FC = () => {
  const { isPlatformAndroid } = useResponsive();
  const [backButtonHandled, setBackButtonHandled] = useState(false);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [notificationPermission, setNotificationPermission] = useState<string>('default');

  useEffect(() => {
    if (!isPlatformAndroid) return;

    // Back button handling
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      setBackButtonHandled(true);
      setNavigationHistory(prev => [...prev, `Back button pressed at ${new Date().toLocaleTimeString()}`]);
      
      // Custom back button logic here
      console.log('Android back button intercepted');
      
      // Reset after 2 seconds
      setTimeout(() => setBackButtonHandled(false), 2000);
    };

    // PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isPlatformAndroid]);

  const testBackButton = () => {
    // Add a history entry to test back navigation
    window.history.pushState({ test: true }, '', '#test');
    setNavigationHistory(prev => [...prev, `Test navigation added at ${new Date().toLocaleTimeString()}`]);
  };

  const testNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Notifications not supported');
      return;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }

    if (Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from the Android Feature Tester',
        icon: '/icon-192x192.png'
      });
    }
  };

  const testPWAInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      console.log(`PWA install prompt result: ${outcome}`);
      setInstallPrompt(null);
    }
  };

  const testHapticFeedback = () => {
    hapticFeedback.medium();
  };

  const testWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Android Feature Test',
          text: 'Testing web share API on Android',
          url: window.location.href
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      alert('Web Share API not supported');
    }
  };

  const getAndroidVersion = () => {
    const match = navigator.userAgent.match(/Android (\d+(?:\.\d+)?)/);
    return match ? match[1] : 'Unknown';
  };

  if (!isPlatformAndroid) {
    return (
      <div className="p-4">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Android Feature Tester</h2>
          <p className="text-gray-600">
            This component is only available on Android devices.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Current platform: {Platform.getPlatformName()}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Android Feature Tester</h2>
        <Badge variant="secondary">Android {getAndroidVersion()}</Badge>
      </div>

      {/* Back Button Testing */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Back Button Handling</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Button onClick={testBackButton} variant="outline">
              Add Test Navigation
            </Button>
            <Badge variant={backButtonHandled ? "default" : "secondary"}>
              {backButtonHandled ? "Back Intercepted!" : "Waiting..."}
            </Badge>
          </div>
          
          <div className="text-sm text-gray-600">
            <p className="mb-2">Navigation History:</p>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {navigationHistory.length === 0 ? (
                <p className="text-gray-400">No navigation events yet</p>
              ) : (
                navigationHistory.map((event, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                    {event}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* PWA Features */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">PWA Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">App Installation</h4>
            <Button
              onClick={testPWAInstall}
              disabled={!installPrompt}
              variant="outline"
              size="sm"
            >
              {installPrompt ? 'Install App' : 'Install Prompt Not Available'}
            </Button>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Notifications</h4>
            <div className="flex items-center gap-2">
              <Button onClick={testNotifications} variant="outline" size="sm">
                Test Notification
              </Button>
              <Badge variant={notificationPermission === 'granted' ? 'default' : 'secondary'}>
                {notificationPermission}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* System Integration */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">System Integration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Haptic Feedback</h4>
            <Button onClick={testHapticFeedback} variant="outline" size="sm">
              Test Vibration
            </Button>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Web Share API</h4>
            <Button onClick={testWebShare} variant="outline" size="sm">
              Test Share
            </Button>
          </div>
        </div>
      </Card>

      {/* Android-specific Info */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Device Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Android Version:</span>
              <span className="font-mono">{getAndroidVersion()}</span>
            </div>
            <div className="flex justify-between">
              <span>Screen Size:</span>
              <span className="font-mono">{window.innerWidth}×{window.innerHeight}</span>
            </div>
            <div className="flex justify-between">
              <span>Pixel Ratio:</span>
              <span className="font-mono">{window.devicePixelRatio}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Touch Support:</span>
              <span className="font-mono">{'ontouchstart' in window ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span>PWA Display:</span>
              <span className="font-mono">
                {window.matchMedia('(display-mode: standalone)').matches ? 'Standalone' : 'Browser'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Connection:</span>
              <span className="font-mono">
                {(navigator as any).connection?.effectiveType || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold mb-2 text-blue-900">Testing Instructions</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Use the device's back button to test navigation handling</p>
          <p>• Grant notification permissions to test push notifications</p>
          <p>• Try installing the app as a PWA for full experience</p>
          <p>• Test haptic feedback with different intensities</p>
          <p>• Use the share button to test native sharing</p>
        </div>
      </Card>
    </div>
  );
};
