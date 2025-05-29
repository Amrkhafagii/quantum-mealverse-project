
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  Chrome, 
  Settings, 
  RotateCcw, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface LocationTroubleshootingGuideProps {
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unknown';
  hasLocation: boolean;
  error?: string | null;
}

export const LocationTroubleshootingGuide: React.FC<LocationTroubleshootingGuideProps> = ({
  permissionStatus,
  hasLocation,
  error
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const troubleshootingSections = [
    {
      id: 'browser-permissions',
      title: 'Browser Permission Issues',
      icon: <Chrome className="h-4 w-4" />,
      description: 'How to reset and grant location permissions',
      content: (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-800 mb-2">Chrome/Edge:</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Click the lock/location icon in the address bar</li>
              <li>Select "Allow" for location access</li>
              <li>Refresh the page</li>
            </ol>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <h4 className="font-medium text-orange-800 mb-2">Firefox:</h4>
            <ol className="text-sm text-orange-700 space-y-1 list-decimal list-inside">
              <li>Click the shield icon in the address bar</li>
              <li>Turn off "Enhanced Tracking Protection" for this site</li>
              <li>Click the location icon and select "Allow"</li>
            </ol>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <h4 className="font-medium text-purple-800 mb-2">Safari:</h4>
            <ol className="text-sm text-purple-700 space-y-1 list-decimal list-inside">
              <li>Go to Safari → Preferences → Websites</li>
              <li>Select "Location" from the sidebar</li>
              <li>Set this website to "Allow"</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'system-settings',
      title: 'System Location Settings',
      icon: <Settings className="h-4 w-4" />,
      description: 'Check your device location settings',
      content: (
        <div className="space-y-3">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="font-medium text-gray-800 mb-2">Windows:</h4>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Open Settings → Privacy & Security → Location</li>
              <li>Ensure "Location services" is turned on</li>
              <li>Allow desktop apps to access location</li>
            </ol>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="font-medium text-gray-800 mb-2">macOS:</h4>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Open System Preferences → Security & Privacy → Privacy</li>
              <li>Select "Location Services" from the left sidebar</li>
              <li>Enable location services and allow your browser</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'common-issues',
      title: 'Common Issues & Solutions',
      icon: <AlertTriangle className="h-4 w-4" />,
      description: 'Quick fixes for typical problems',
      content: (
        <div className="space-y-3">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <h4 className="font-medium text-yellow-800 mb-2">Location Not Accurate:</h4>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>Try refreshing the page</li>
              <li>Clear browser cache and cookies</li>
              <li>Use manual location entry as backup</li>
            </ul>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <h4 className="font-medium text-red-800 mb-2">Permission Denied:</h4>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>Check if location services are enabled system-wide</li>
              <li>Try incognito/private browsing mode</li>
              <li>Reset browser permissions for this site</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <h4 className="font-medium text-green-800 mb-2">Still Not Working?</h4>
            <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
              <li>Use the manual location entry option</li>
              <li>Try a different browser</li>
              <li>Check your internet connection</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const getStatusBadge = () => {
    if (hasLocation) {
      return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Working</Badge>;
    }
    
    switch (permissionStatus) {
      case 'granted':
        return <Badge variant="outline"><MapPin className="h-3 w-3 mr-1" />Granted</Badge>;
      case 'denied':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Denied</Badge>;
      case 'prompt':
        return <Badge variant="secondary"><HelpCircle className="h-3 w-3 mr-1" />Prompt</Badge>;
      default:
        return <Badge variant="outline"><HelpCircle className="h-3 w-3 mr-1" />Unknown</Badge>;
    }
  };

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <HelpCircle className="h-5 w-5" />
            Location Troubleshooting
          </CardTitle>
          {getStatusBadge()}
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded p-2 border border-red-200">
            Current Error: {error}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {troubleshootingSections.map((section) => (
          <div key={section.id} className="border border-blue-200 rounded-lg">
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto text-left"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center gap-3">
                {section.icon}
                <div>
                  <div className="font-medium">{section.title}</div>
                  <div className="text-sm text-gray-600">{section.description}</div>
                </div>
              </div>
              {expandedSection === section.id ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            
            {expandedSection === section.id && (
              <div className="p-4 pt-0">
                {section.content}
              </div>
            )}
          </div>
        ))}
        
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mt-4">
          <p className="text-sm text-blue-800 font-medium mb-2">Quick Test:</p>
          <p className="text-xs text-blue-700">
            Current Status: Permission {permissionStatus}, Location {hasLocation ? 'Available' : 'Not Available'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
