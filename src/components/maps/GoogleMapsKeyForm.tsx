
import React from 'react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GoogleMapsKeyFormProps {
  className?: string;
  variant?: 'default' | 'compact' | 'inline';
  onKeySubmit?: (success: boolean) => void;
}

export const GoogleMapsKeyForm: React.FC<GoogleMapsKeyFormProps> = ({ 
  className = '',
  variant = 'default',
  onKeySubmit
}) => {
  const { googleMapsApiKey, keySource } = useGoogleMaps();

  if (variant === 'compact' || variant === 'inline') {
    // For compact and inline variants, show nothing since we don't need user input
    return null;
  }

  // Default full form - now just shows info that API key is configured
  return (
    <Card className={cn("max-w-md", className)}>
      <CardHeader>
        <CardTitle>Google Maps API Key</CardTitle>
        <CardDescription>
          Google Maps API key is preconfigured for this application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-green-600">
          <InfoIcon className="h-4 w-4" />
          <span>Maps functionality is ready to use</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleMapsKeyForm;
