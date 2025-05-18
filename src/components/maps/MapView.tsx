
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const MapView = () => {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardContent className="p-6">
          <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Map View Placeholder</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapView;
