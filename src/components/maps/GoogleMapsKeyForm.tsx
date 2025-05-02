
import React, { useState } from 'react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface GoogleMapsKeyFormProps {
  onKeySubmit?: () => void;
  className?: string;
}

export const GoogleMapsKeyForm: React.FC<GoogleMapsKeyFormProps> = ({ 
  onKeySubmit,
  className = '' 
}) => {
  const { googleMapsApiKey, setGoogleMapsApiKey } = useGoogleMaps();
  const [apiKey, setApiKey] = useState(googleMapsApiKey || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Save the API key
    setGoogleMapsApiKey(apiKey.trim());
    
    // Callback if provided
    if (onKeySubmit) onKeySubmit();
    
    setIsSubmitting(false);
  };

  return (
    <Card className={`${className} max-w-md mx-auto`}>
      <CardHeader>
        <CardTitle>Google Maps API Key</CardTitle>
        <CardDescription>
          Please enter your Google Maps API key to enable mapping features.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You can get an API key from the{" "}
              <a 
                href="https://console.cloud.google.com/google/maps-apis/credentials" 
                target="_blank" 
                rel="noreferrer"
                className="text-quantum-cyan hover:underline"
              >
                Google Cloud Console
              </a>
            </p>
            
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your Google Maps API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={isSubmitting || !apiKey.trim()} 
            className="w-full"
          >
            {isSubmitting ? "Saving..." : "Save API Key"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
