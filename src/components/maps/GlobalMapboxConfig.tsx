import React, { useState, useEffect } from 'react';
import { useDeliveryMap } from '@/contexts/DeliveryMapContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from '@/hooks/use-toast';

const GlobalMapboxConfig: React.FC = () => {
  const { mapboxToken, setMapboxToken } = useDeliveryMap();
  const [token, setToken] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    if (mapboxToken) {
      setToken(mapboxToken);
    }
  }, [mapboxToken]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Mapbox token",
        variant: "destructive",
      });
      return;
    }
    
    // Basic validation - Mapbox tokens are typically pk.* format
    if (!token.startsWith('pk.')) {
      toast({
        title: "Warning",
        description: "Token should start with 'pk.' (Mapbox public token)",
        variant: "default",
      });
      return;
    }
    
    setMapboxToken(token);
    
    toast({
      title: "Mapbox Configured",
      description: "Your Mapbox token has been saved and will be used for all maps",
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
            <CardTitle>Global Mapbox Configuration</CardTitle>
            <CardDescription>
              Enter your token once to enable all maps
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="global-mapbox-token">Mapbox Token</Label>
                <Input 
                  id="global-mapbox-token"
                  type="text"
                  placeholder="pk.eyJ1Ijo..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Find your token at <a href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">mapbox.com</a>
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
              <Button type="submit">Save Token</Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <Button 
          onClick={() => setShowConfig(true)}
          variant={mapboxToken ? "outline" : "default"}
          size="sm"
          className="shadow-lg"
        >
          {mapboxToken ? "Change Mapbox Token" : "Set Mapbox Token"}
        </Button>
      )}
    </div>
  );
};

export default GlobalMapboxConfig;
