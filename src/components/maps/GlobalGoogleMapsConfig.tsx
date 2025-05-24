
import React, { useState, useEffect } from 'react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { GoogleMapsKeyForm } from './GoogleMapsKeyForm';
import { Badge } from '@/components/ui/badge';

const GlobalGoogleMapsConfig: React.FC = () => {
  const { googleMapsApiKey, keySource, isLoading, clearApiKey } = useGoogleMaps();
  const [showConfig, setShowConfig] = useState(false);
  const { user } = useAuth();
  
  // Determine if user is an admin (only admins should see this component)
  const userType = user?.user_metadata?.user_type;
  const isAdmin = userType === 'admin' || userType === 'developer';
  
  // If not admin, don't render the component
  if (!isAdmin) return null;

  const handleClearApiKey = async () => {
    try {
      await clearApiKey();
      setShowConfig(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear API key",
        variant: "destructive",
      });
    }
  };

  const handleKeySubmit = (success: boolean) => {
    if (success) {
      setShowConfig(false);
    }
  };

  const getKeySourceBadgeColor = () => {
    switch (keySource) {
      case 'database':
        return 'bg-green-500';
      case 'localStorage':
        return 'bg-yellow-500';
      case 'environment':
        return 'bg-blue-500';
      case 'default':
        return 'bg-gray-500';
      case 'none':
      default:
        return 'bg-red-500';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {showConfig ? (
        <Card className="w-96 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Google Maps Configuration</CardTitle>
              <Badge 
                variant="outline"
                className={`${getKeySourceBadgeColor()} text-white`}
              >
                {keySource}
              </Badge>
            </div>
            <CardDescription>
              {googleMapsApiKey 
                ? "Your Google Maps API key is configured"
                : "Enter your API key to enable maps"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-2">
            <GoogleMapsKeyForm 
              onKeySubmit={handleKeySubmit}
              variant="compact"
            />
          </CardContent>
          
          <CardFooter className="flex justify-between pt-2 border-t">
            <Button 
              type="button" 
              variant="outline"
              size="sm"
              onClick={() => setShowConfig(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
            
            {googleMapsApiKey && (
              <Button 
                type="button" 
                variant="destructive" 
                size="sm"
                onClick={handleClearApiKey}
                disabled={isLoading}
              >
                Clear API Key
              </Button>
            )}
          </CardFooter>
        </Card>
      ) : (
        <Button 
          onClick={() => setShowConfig(true)}
          variant={googleMapsApiKey ? "outline" : "default"}
          size="sm"
          className="shadow-lg flex items-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : googleMapsApiKey ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              Google Maps API Key
            </>
          ) : (
            <>
              <Settings className="h-4 w-4" />
              Set Google Maps API Key
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default GlobalGoogleMapsConfig;
