
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Download, History } from 'lucide-react';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';
import { useAuth } from '@/hooks/useAuth';

export const LocationHistoryManager = () => {
  const { user } = useAuth();
  const {
    retentionPolicy,
    loading,
    isProcessing,
    exportLocationData
  } = usePrivacySettings(user?.id || '');

  const [exportFormat, setExportFormat] = React.useState<'json' | 'csv' | 'gpx'>('json');
  const [includeAnonymized, setIncludeAnonymized] = React.useState(false);

  const handleExport = async () => {
    await exportLocationData(exportFormat);
  };

  if (loading) {
    return (
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-quantum-cyan" />
            <span className="ml-2 text-quantum-cyan">Loading history manager...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-quantum-cyan/20 bg-transparent">
      <CardHeader>
        <CardTitle className="flex items-center">
          <History className="mr-2 h-5 w-5" />
          Location History Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select
              value={exportFormat}
              onValueChange={(value: 'json' | 'csv' | 'gpx') => setExportFormat(value)}
              disabled={isProcessing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select export format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON (Structured data)</SelectItem>
                <SelectItem value="csv">CSV (Spreadsheet compatible)</SelectItem>
                <SelectItem value="gpx">GPX (GPS exchange format)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Include Anonymized Data</Label>
              <p className="text-sm text-muted-foreground">
                Include previously anonymized location records
              </p>
            </div>
            <Button
              variant={includeAnonymized ? "default" : "outline"}
              size="sm"
              onClick={() => setIncludeAnonymized(!includeAnonymized)}
              disabled={isProcessing}
            >
              {includeAnonymized ? 'Included' : 'Excluded'}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleExport} 
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export Location History
          </Button>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Export includes all location data based on your current retention policy</p>
            <p>• Files are generated on-demand and include timestamps</p>
            <p>• GPX format is compatible with most GPS applications</p>
            <p>• CSV format can be opened in spreadsheet applications</p>
          </div>
        </div>

        <div className="pt-4 border-t border-quantum-cyan/20">
          <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Data Retention Info</h4>
            <div className="text-xs text-blue-800 dark:text-blue-200 mt-1 space-y-1">
              <p>• Current retention period: {retentionPolicy?.retention_period_days || 30} days</p>
              <p>• Auto-anonymization: {retentionPolicy?.auto_anonymize_after_days || 7} days</p>
              <p>• Default export format: {retentionPolicy?.export_format?.toUpperCase() || 'JSON'}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
