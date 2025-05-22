
import React, { useState } from 'react';
import { useDataRetention } from '@/hooks/useDataRetention';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Trash2, Clock, Shield } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const DataRetentionSettings = () => {
  const { deleteAllUserData, getRetentionConfigs, isProcessing } = useDataRetention();
  const { user } = useAuth();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const configs = getRetentionConfigs();

  const handleDeleteData = async () => {
    await deleteAllUserData();
    setConfirmDialogOpen(false);
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Retention Settings</CardTitle>
          <CardDescription>You must be logged in to manage your data settings</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Data Retention Policies
          </CardTitle>
          <CardDescription>
            How we handle your location and personal data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Location Data</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                We store your location data for {configs.LOCATION_DATA.purgeAfterDays} days
                and anonymize it after {configs.LOCATION_DATA.anonymizeAfterDays} days.
              </p>
              <ul className="list-disc pl-5 text-sm">
                <li>Precise location data is kept for delivery purposes</li>
                <li>After {configs.LOCATION_DATA.anonymizeAfterDays} days, we remove personally identifiable information</li>
                <li>After {configs.LOCATION_DATA.purgeAfterDays} days, the data is permanently deleted</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Order History</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Order history is retained for {configs.ORDER_DATA.purgeAfterDays} days
                for legal and business purposes.
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-md border border-amber-200 dark:border-amber-800">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-300">Data Deletion</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    You can delete all your personal data at any time. This action cannot be undone.
                    Any active orders won't be affected.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="destructive" 
            onClick={() => setConfirmDialogOpen(true)} 
            disabled={isProcessing}
            className="flex items-center"
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete My Data
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete All Your Data?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your personal data, including location history, 
              will be permanently deleted from our servers.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium">The following data will be deleted:</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-gray-500 dark:text-gray-400">
              <li>Location history</li>
              <li>Device information</li>
              <li>Personal identifiers from anonymized records</li>
            </ul>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Your account information and active orders will not be affected.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteData}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Confirm Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DataRetentionSettings;
