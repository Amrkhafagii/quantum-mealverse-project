
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LogDisplayModal from '@/components/LogDisplayModal';
import LocationHistoryDashboard from '@/components/location/LocationHistoryDashboard';
import { AdaptiveLocationTracker } from '@/components/location/AdaptiveLocationTracker';
import { LocationHistoryEntry } from '@/types/location';

interface DebugSectionProps {
  showLocationLogs: boolean;
  showLocationHistory: boolean;
  showAdaptiveTracker: boolean;
  locationHistory: LocationHistoryEntry[];
  onToggleLocationLogs: () => void;
  onToggleLocationHistory: () => void;
  onToggleAdaptiveTracker: () => void;
  onClearLocationStorage: () => void;
  onExportLogs: () => void;
}

export const DebugSection: React.FC<DebugSectionProps> = ({
  showLocationLogs,
  showLocationHistory,
  showAdaptiveTracker,
  locationHistory,
  onToggleLocationLogs,
  onToggleLocationHistory,
  onToggleAdaptiveTracker,
  onClearLocationStorage,
  onExportLogs
}) => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Location Debugging</CardTitle>
          <CardDescription>Tools for testing and debugging location services.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-x-2">
            <Button onClick={onToggleLocationLogs}>Show Location Logs</Button>
            <Button onClick={onClearLocationStorage}>Clear Location Storage</Button>
            <Button onClick={onExportLogs}>Export Location Logs</Button>
            <Button onClick={onToggleLocationHistory}>Show Location History</Button>
            <Button onClick={onToggleAdaptiveTracker}>
              Show Adaptive Location Tracker
            </Button>
          </div>
        </CardContent>
      </Card>

      <LogDisplayModal
        isOpen={showLocationLogs}
        onClose={() => onToggleLocationLogs()}
      />

      {/* Note: LocationHistoryDashboard component interface needs to be checked */}
      {showLocationHistory && (
        <Card>
          <CardHeader>
            <CardTitle>Location History</CardTitle>
            <CardDescription>View your location tracking history.</CardDescription>
          </CardHeader>
          <CardContent>
            <div>Location history would be displayed here</div>
            <Button onClick={() => onToggleLocationHistory()}>Close History</Button>
          </CardContent>
        </Card>
      )}

      {showAdaptiveTracker && (
        <Card>
          <CardHeader>
            <CardTitle>Adaptive Location Tracker</CardTitle>
            <CardDescription>
              Demonstrates adaptive location tracking based on various factors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdaptiveLocationTracker />
            <Button onClick={onToggleAdaptiveTracker}>Close Tracker</Button>
          </CardContent>
        </Card>
      )}
    </>
  );
};
