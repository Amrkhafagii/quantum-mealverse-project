
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Download, Trash2 } from 'lucide-react';
import { useLocationHistory } from '@/hooks/useLocationHistory';
import { LocationHistoryEntry } from '@/types/unifiedLocation';

const LocationHistoryDashboard: React.FC = () => {
  const {
    locationHistory,
    isLoading,
    stats,
    exportHistory,
    deleteHistory,
    updateDateRange,
    dateRange
  } = useLocationHistory();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader>
            <CardTitle className="text-sm">Total Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-quantum-cyan">
              {stats.totalLocations}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader>
            <CardTitle className="text-sm">First Record</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-300">
              {stats.firstLocation || 'No data'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
          <CardHeader>
            <CardTitle className="text-sm">Last Record</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-300">
              {stats.lastLocation || 'No data'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Location History
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => exportHistory('json')}
              size="sm"
              variant="outline"
              disabled={isLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button
              onClick={() => exportHistory('csv')}
              size="sm"
              variant="outline"
              disabled={isLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button
              onClick={deleteHistory}
              size="sm"
              variant="destructive"
              disabled={isLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {locationHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No location history available
            </div>
          ) : (
            <div className="space-y-4">
              {locationHistory.map((entry: LocationHistoryEntry) => (
                <div
                  key={entry.id}
                  className="p-4 border border-quantum-cyan/10 rounded-md bg-quantum-black/30"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-quantum-cyan" />
                      <span className="font-medium">
                        {entry.location.latitude.toFixed(6)}, {entry.location.longitude.toFixed(6)}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {entry.location.source || 'unknown'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-300">
                    <div>
                      <span className="text-gray-400">Accuracy:</span>{' '}
                      {entry.location.accuracy ? `${entry.location.accuracy}m` : 'N/A'}
                    </div>
                    <div>
                      <span className="text-gray-400">Speed:</span>{' '}
                      {entry.location.speed ? `${entry.location.speed} m/s` : 'N/A'}
                    </div>
                    <div>
                      <span className="text-gray-400">Confidence:</span>{' '}
                      {entry.confidence.overall.toFixed(2)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationHistoryDashboard;
