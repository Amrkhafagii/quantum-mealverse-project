
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface MapboxTokenFormProps {
  onTokenSubmit: (token: string) => void;
}

const MapboxTokenForm: React.FC<MapboxTokenFormProps> = ({ onTokenSubmit }) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token.trim()) {
      setError('Please enter a valid Mapbox token');
      return;
    }
    
    // Basic validation - Mapbox tokens are typically pk.* format
    if (!token.startsWith('pk.')) {
      setError('Token should start with "pk." (Mapbox public token)');
      return;
    }
    
    setError('');
    onTokenSubmit(token);
    
    // Store token in localStorage for persistence
    localStorage.setItem('mapbox_token', token);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Mapbox Configuration</CardTitle>
        <CardDescription>
          Enter your Mapbox public token to enable maps and location services
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
              <Input 
                id="mapbox-token"
                type="text"
                placeholder="pk.eyJ1Ijo..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            
            <p className="text-xs text-gray-500">
              To get a token, create an account at <a href="https://www.mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">mapbox.com</a> and generate a public token from your dashboard.
            </p>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button type="submit" className="w-full">
            Save Token
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default MapboxTokenForm;
