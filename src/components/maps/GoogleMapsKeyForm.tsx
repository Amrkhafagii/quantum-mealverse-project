
import React, { useState, useEffect } from 'react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoogleMapsKeyFormProps {
  onKeySubmit?: (success: boolean) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'inline';
}

export const GoogleMapsKeyForm: React.FC<GoogleMapsKeyFormProps> = ({ 
  onKeySubmit,
  className = '',
  variant = 'default'
}) => {
  const { googleMapsApiKey, setGoogleMapsApiKey, validateApiKey, keySource, isLoading } = useGoogleMaps();
  const [apiKey, setApiKey] = useState(googleMapsApiKey || '');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when context API key changes
  useEffect(() => {
    if (googleMapsApiKey && googleMapsApiKey !== apiKey) {
      setApiKey(googleMapsApiKey);
    }
  }, [googleMapsApiKey]);

  // Validate the API key as the user types (with debounce)
  useEffect(() => {
    if (!apiKey || apiKey.length < 10) {
      setIsValid(null);
      return;
    }
    
    const timer = setTimeout(async () => {
      if (apiKey !== googleMapsApiKey) {
        setIsValidating(true);
        try {
          const valid = await validateApiKey(apiKey);
          setIsValid(valid);
        } catch (error) {
          setIsValid(false);
        } finally {
          setIsValidating(false);
        }
      } else {
        // If it's the current key, assume it's valid
        setIsValid(true);
      }
    }, 800);
    
    return () => clearTimeout(timer);
  }, [apiKey, validateApiKey, googleMapsApiKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Save the API key
      const success = await setGoogleMapsApiKey(apiKey.trim());
      
      // Callback if provided
      if (onKeySubmit) onKeySubmit(success);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine validation status icon
  const getValidationIcon = () => {
    if (isValidating) {
      return <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent" />;
    } else if (isValid === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (isValid === false) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  if (variant === 'compact') {
    // Compact variant for smaller spaces
    return (
      <form onSubmit={handleSubmit} className={cn("space-y-4", className)}>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your Google Maps API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              required
              className="flex-1"
              disabled={isSubmitting || isLoading}
            />
            {getValidationIcon()}
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting || isLoading || isValid === false || !apiKey.trim()} 
            className="w-full"
            size="sm"
          >
            {isSubmitting ? "Saving..." : "Save API Key"}
          </Button>
        </div>
      </form>
    );
  }

  if (variant === 'inline') {
    // Inline variant for embedding in forms
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center gap-2">
          <Input
            id="apiKey"
            type="password"
            placeholder="Enter your Google Maps API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-1"
            disabled={isSubmitting || isLoading}
          />
          <Button 
            type="button" 
            disabled={isSubmitting || isLoading || isValid === false || !apiKey.trim()} 
            onClick={handleSubmit}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
          {getValidationIcon()}
        </div>
      </div>
    );
  }

  // Default full form
  return (
    <Card className={cn("max-w-md", className)}>
      <CardHeader>
        <CardTitle>Google Maps API Key</CardTitle>
        <CardDescription>
          Please enter your Google Maps API key to enable mapping features.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            {googleMapsApiKey && (
              <Alert variant={keySource === 'database' ? 'default' : 'warning'}>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Current Key Source: {keySource}</AlertTitle>
                <AlertDescription>
                  {keySource === 'database' 
                    ? 'Your API key is stored securely in the database.' 
                    : keySource === 'localStorage' 
                      ? 'Your API key is stored in browser storage.' 
                      : keySource === 'environment' 
                        ? 'Using API key from environment variables.'
                        : 'Using default API key with limited quota.'}
                </AlertDescription>
              </Alert>
            )}
            
            <p className="text-sm text-muted-foreground">
              You can get an API key from the{" "}
              <a 
                href="https://console.cloud.google.com/google/maps-apis/credentials" 
                target="_blank" 
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                Google Cloud Console
              </a>
            </p>
            
            <div className="relative">
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your Google Maps API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                className="pr-8"
                disabled={isSubmitting || isLoading}
              />
              {apiKey.length > 0 && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  {getValidationIcon()}
                </div>
              )}
            </div>
            
            {isValid === false && (
              <div className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                This API key appears to be invalid
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={isSubmitting || isLoading || isValid === false || !apiKey.trim()} 
            className="w-full"
          >
            {isSubmitting ? "Saving..." : "Save API Key"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default GoogleMapsKeyForm;
