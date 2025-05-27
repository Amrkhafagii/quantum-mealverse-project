
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield } from 'lucide-react';
import { LocationRetentionSettings } from './LocationRetentionSettings';
import { DataAnonymizationControls } from './DataAnonymizationControls';
import { ThirdPartyDataSharingSettings } from './ThirdPartyDataSharingSettings';
import { LocationHistoryManager } from './LocationHistoryManager';
import { useAuth } from '@/hooks/useAuth';

const DataRetentionSettings = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Privacy & Data Management
          </CardTitle>
          <CardDescription>You must be logged in to manage your privacy settings</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border border-quantum-cyan/20 bg-transparent">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5" />
          Privacy & Data Management
        </CardTitle>
        <CardDescription>
          Control how your data is stored, processed, and shared
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="retention" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="retention">Retention</TabsTrigger>
            <TabsTrigger value="anonymization">Anonymization</TabsTrigger>
            <TabsTrigger value="sharing">Third-Party</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="retention" className="space-y-4">
            <LocationRetentionSettings />
          </TabsContent>

          <TabsContent value="anonymization" className="space-y-4">
            <DataAnonymizationControls />
          </TabsContent>

          <TabsContent value="sharing" className="space-y-4">
            <ThirdPartyDataSharingSettings />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <LocationHistoryManager />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DataRetentionSettings;
