
import React, { useState, useEffect } from 'react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const GlobalGoogleMapsConfig: React.FC = () => {
  const { googleMapsApiKey, setGoogleMapsApiKey, isLoading } = useGoogleMaps();
  const [apiKey, setApiKey] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const { user } = useAuth();
  
  // Determine if user is an admin (only admins should see this component)
  const userType = user?.user_metadata?.user_type;
  const isAdmin = userType === 'admin';
  
  // If not admin, don't render the component
  if (!isAdmin) return null;

  useEffect(() => {
    if (googleMapsApiKey) {
      setApiKey(googleMapsApiKey);
    }
  }, [googleMapsApiKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Google Maps API key",
        variant: "destructive",
      });
      return;
    }
    
    // Basic validation - Google Maps API keys are typically around 39 characters
    if (apiKey.length < 20) {
      toast({
        title: "Warning",
        description: "This doesn't look like a valid Google Maps API key",
        variant: "default",
      });
      return;
    }
    
    setGoogleMapsApiKey(apiKey);
    
    toast({
      title: "Google Maps Configured",
      description: "Your Google Maps API key has been saved and will be used for all maps",
      variant: "default",
    });
    
    // Close the config after successful save
    setShowConfig(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {showConfig ? (
        <Card className="w-80">
          <CardHeader className="pb-2">
            <CardTitle>Google Maps Configuration</CardTitle>
            <CardDescription>
              Enter your API key once to enable all maps
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="global-google-maps-key">Google Maps API Key</Label>
                <Input 
                  id="global-google-maps-key"
                  type="text"
                  placeholder="AIzaSyB..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Find your API key at <a href="https://console.cloud.google.com/google/maps-apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Google Cloud Console</a>
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowConfig(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save API Key</Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <Button 
          onClick={() => setShowConfig(true)}
          variant={googleMapsApiKey ? "outline" : "default"}
          size="sm"
          className="shadow-lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : googleMapsApiKey ? (
            "Change Google Maps API Key"
          ) : (
            "Set Google Maps API Key"
          )}
        </Button>
      )}
    </div>
  );
};

export default GlobalGoogleMapsConfig;
