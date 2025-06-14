
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2, Clock, Trash2 } from 'lucide-react';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const LocationRetentionSettings = () => {
  const { user } = useAuth();
  const {
    retentionPolicy,
    loading,
    isProcessing,
    updateRetentionPolicy,
    deleteLocationHistory
  } = usePrivacySettings(user?.id || '');

  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [deleteOlderThan, setDeleteOlderThan] = React.useState<number | undefined>(undefined);

  const handleRetentionChange = (field: string, value: string | number) => {
    updateRetentionPolicy({ [field]: value });
  };

  const handleDeleteHistory = async () => {
    await deleteLocationHistory(deleteOlderThan);
    setShowDeleteDialog(false);
    setDeleteOlderThan(undefined);
  };

  if (loading) {
    return (
      <Card className="border border-quantum-cyan/20 bg-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-quantum-cyan" />
            <span className="ml-2 text-quantum-cyan">Loading retention settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-quantum-cyan/20 bg-transparent">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Location Data Retention
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Retention Period</Label>
          <Select
            value={retentionPolicy?.retention_period_days?.toString()}
            onValueChange={(value) => handleRetentionChange('retention_period_days', parseInt(value))}
            disabled={isProcessing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select retention period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="180">6 months</SelectItem>
              <SelectItem value="365">1 year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Auto-anonymize after</Label>
          <Select
            value={retentionPolicy?.auto_anonymize_after_days?.toString()}
            onValueChange={(value) => handleRetentionChange('auto_anonymize_after_days', parseInt(value))}
            disabled={isProcessing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select anonymization period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 day</SelectItem>
              <SelectItem value="3">3 days</SelectItem>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Export Format</Label>
          <Select
            value={retentionPolicy?.export_format}
            onValueChange={(value) => handleRetentionChange('export_format', value)}
            disabled={isProcessing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select export format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="gpx">GPX</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4 border-t border-quantum-cyan/20">
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full" disabled={isProcessing}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Location History
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Location History</DialogTitle>
                <DialogDescription>
                  Choose how much of your location history to delete. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Delete data older than</Label>
                  <Select
                    value={deleteOlderThan?.toString() || 'all'}
                    onValueChange={(value) => setDeleteOlderThan(value === 'all' ? undefined : parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All data</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">6 months</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteHistory} disabled={isProcessing}>
                  {isProcessing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};
