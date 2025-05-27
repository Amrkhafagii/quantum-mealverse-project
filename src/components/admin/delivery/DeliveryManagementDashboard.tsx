
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  UserCheck, 
  AlertTriangle, 
  MapPin, 
  TrendingUp,
  Star,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useDeliveryManagement } from '@/hooks/admin/useDeliveryManagement';
import { DriverApprovalTable } from './DriverApprovalTable';
import { PerformanceAlertsTable } from './PerformanceAlertsTable';
import { DeliveryZonesMap } from './DeliveryZonesMap';

export const DeliveryManagementDashboard: React.FC = () => {
  const {
    loading,
    stats,
    loadDriverApprovals,
    loadPerformanceAlerts,
    loadDeliveryZones,
    approveDriver,
    rejectDriver,
    resolveAlert
  } = useDeliveryManagement();

  const [activeTab, setActiveTab] = useState('overview');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'approvals') {
      loadDriverApprovals();
    } else if (tab === 'alerts') {
      loadPerformanceAlerts(false);
    } else if (tab === 'zones') {
      loadDeliveryZones();
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-quantum-cyan">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-quantum-cyan">Delivery Management</h1>
        <Badge variant="outline" className="text-quantum-cyan border-quantum-cyan">
          Admin Dashboard
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="approvals">Driver Approvals</TabsTrigger>
          <TabsTrigger value="alerts">Performance Alerts</TabsTrigger>
          <TabsTrigger value="zones">Delivery Zones</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="holographic-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
                <Users className="h-4 w-4 text-quantum-cyan" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-quantum-cyan">{stats?.totalDrivers || 0}</div>
              </CardContent>
            </Card>

            <Card className="holographic-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <UserCheck className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">{stats?.pendingApprovals || 0}</div>
              </CardContent>
            </Card>

            <Card className="holographic-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{stats?.activeAlerts || 0}</div>
              </CardContent>
            </Card>

            <Card className="holographic-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Delivery Zones</CardTitle>
                <MapPin className="h-4 w-4 text-quantum-cyan" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-quantum-cyan">{stats?.totalZones || 0}</div>
              </CardContent>
            </Card>

            <Card className="holographic-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Deliveries</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{stats?.todayDeliveries || 0}</div>
              </CardContent>
            </Card>

            <Card className="holographic-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">{stats?.avgRating || 0}</div>
              </CardContent>
            </Card>
          </div>

          {stats?.pendingApprovals && stats.pendingApprovals > 0 && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                You have {stats.pendingApprovals} driver approval{stats.pendingApprovals > 1 ? 's' : ''} pending review.
              </AlertDescription>
            </Alert>
          )}

          {stats?.activeAlerts && stats.activeAlerts > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                There are {stats.activeAlerts} active performance alert{stats.activeAlerts > 1 ? 's' : ''} requiring attention.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="approvals">
          <DriverApprovalTable 
            onApprove={approveDriver}
            onReject={rejectDriver}
          />
        </TabsContent>

        <TabsContent value="alerts">
          <PerformanceAlertsTable 
            onResolve={resolveAlert}
          />
        </TabsContent>

        <TabsContent value="zones">
          <DeliveryZonesMap />
        </TabsContent>
      </Tabs>
    </div>
  );
};
