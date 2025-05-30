import React, { useState } from 'react';
import { useLocationHistory } from '@/hooks/useLocationHistory';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Calendar, 
  Download, 
  Map, 
  Trash2, 
  Info,
  FileJson,
  FileSpreadsheet,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { LocationHistoryEntry } from '@/types/unifiedLocation';
import { Badge } from '@/components/ui/badge';

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
  
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleApplyFilters = () => {
    updateDateRange(startDate || undefined, endDate || undefined);
  };
  
  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    updateDateRange(undefined, undefined);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy - HH:mm');
    } catch (e) {
      return dateString;
    }
  };

  const renderSourceBadge = (source: string) => {
    const badgeColors: Record<string, string> = {
      'gps': 'bg-green-500/20 border-green-500/30 text-green-400',
      'network': 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      'wifi': 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      'cell_tower': 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
      'ip': 'bg-red-500/20 border-red-500/30 text-red-400',
      'manual': 'bg-gray-500/20 border-gray-500/30 text-gray-400',
      'cached': 'bg-orange-500/20 border-orange-500/30 text-orange-400',
    };
    
    return (
      <Badge className={`${badgeColors[source] || 'bg-gray-500/20'}`}>
        {source}
      </Badge>
    );
  };

  const formattedTime = timestamp => {
    // Convert timestamp to string if it's a number
    const timestampStr = typeof timestamp === 'number' ? String(timestamp) : timestamp;
    return new Date(timestampStr).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            Location Data Overview
          </CardTitle>
          <CardDescription>
            Summary of your location data and history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-quantum-black/40 p-4 rounded-md">
              <div className="text-sm text-gray-400">Total Records</div>
              <div className="text-2xl font-bold">{stats.totalLocations}</div>
            </div>
            <div className="bg-quantum-black/40 p-4 rounded-md">
              <div className="text-sm text-gray-400">First Recorded</div>
              <div className="text-md font-medium">
                {stats.firstLocation ? formatDate(stats.firstLocation) : 'N/A'}
              </div>
            </div>
            <div className="bg-quantum-black/40 p-4 rounded-md">
              <div className="text-sm text-gray-400">Last Recorded</div>
              <div className="text-md font-medium">
                {stats.lastLocation ? formatDate(stats.lastLocation) : 'N/A'}
              </div>
            </div>
            <div className="bg-quantum-black/40 p-4 rounded-md">
              <div className="text-sm text-gray-400">Unique Devices</div>
              <div className="text-2xl font-bold">{stats.uniqueDevices}</div>
            </div>
          </div>
          
          {/* Date range filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-grow">
              <div>
                <label htmlFor="startDate" className="text-sm text-gray-400 block mb-1">
                  Start Date
                </label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-quantum-black/40 border-quantum-cyan/20"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="text-sm text-gray-400 block mb-1">
                  End Date
                </label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-quantum-black/40 border-quantum-cyan/20"
                />
              </div>
            </div>
            <div className="flex gap-2 self-end">
              <Button variant="outline" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
              <Button variant="ghost" onClick={handleClearFilters}>
                Clear
              </Button>
            </div>
          </div>
          
          {/* Export/Delete controls */}
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              onClick={() => exportHistory('json')}
              disabled={isLoading || stats.totalLocations === 0}
            >
              <FileJson className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => exportHistory('csv')}
              disabled={isLoading || stats.totalLocations === 0}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  disabled={isLoading || stats.totalLocations === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete History
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-quantum-darkBlue border-quantum-cyan/20">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete {dateRange.start || dateRange.end ? 'selected' : 'all'} location history data.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={deleteHistory}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
      
      {/* Location history table */}
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Location History
          </CardTitle>
          <CardDescription>
            Recent locations recorded by the app
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-quantum-cyan" />
            </div>
          ) : locationHistory.length === 0 ? (
            <div className="py-8 text-center">
              <Map className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-300">No location history found</h3>
              <p className="text-gray-400 mt-2">
                {dateRange.start || dateRange.end 
                  ? "No records match your selected date range" 
                  : "You haven't recorded any locations yet"}
              </p>
            </div>
          ) : (
            <Table>
              <TableCaption>
                Showing {locationHistory.length} of {stats.totalLocations} location records
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Coordinates</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Speed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locationHistory.map((location: LocationHistoryEntry) => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">
                      {formattedTime(location.timestamp)}
                    </TableCell>
                    <TableCell>
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </TableCell>
                    <TableCell>
                      {renderSourceBadge(location.source)}
                    </TableCell>
                    <TableCell>
                      {location.accuracy ? `${location.accuracy.toFixed(2)}m` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {location.speed ? `${(location.speed * 3.6).toFixed(1)}km/h` : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-400">
            {dateRange.start || dateRange.end ? (
              <span>Filtered view · {locationHistory.length} results</span>
            ) : (
              <span>Showing most recent {locationHistory.length} location records</span>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LocationHistoryDashboard;
