
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { deliveryManagementService } from '@/services/admin/deliveryManagementService';
import type { DeliveryPerformanceAlert } from '@/types/admin';

interface PerformanceAlertsTableProps {
  onResolve: (id: string, notes: string) => Promise<void>;
}

export const PerformanceAlertsTable: React.FC<PerformanceAlertsTableProps> = ({
  onResolve
}) => {
  const [alerts, setAlerts] = useState<DeliveryPerformanceAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<DeliveryPerformanceAlert | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await deliveryManagementService.getPerformanceAlerts(false);
      setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const getSeverityBadge = (severity: string) => {
    const variants = {
      low: 'default',
      medium: 'secondary',
      high: 'destructive',
      critical: 'destructive'
    } as const;

    const colors = {
      low: 'text-blue-500',
      medium: 'text-yellow-500',
      high: 'text-orange-500',
      critical: 'text-red-500'
    } as const;

    return (
      <Badge variant={variants[severity as keyof typeof variants] || 'default'}>
        <span className={colors[severity as keyof typeof colors] || ''}>
          {severity.toUpperCase()}
        </span>
      </Badge>
    );
  };

  const getAlertTypeBadge = (alertType: string) => {
    const typeLabels = {
      low_rating: 'Low Rating',
      high_cancellation: 'High Cancellation',
      late_delivery: 'Late Delivery',
      customer_complaint: 'Customer Complaint',
      policy_violation: 'Policy Violation'
    };

    return (
      <Badge variant="outline">
        {typeLabels[alertType as keyof typeof typeLabels] || alertType}
      </Badge>
    );
  };

  const handleResolve = async (alert: DeliveryPerformanceAlert) => {
    if (!resolutionNotes.trim()) return;
    await onResolve(alert.id, resolutionNotes);
    setResolutionNotes('');
    setSelectedAlert(null);
    loadAlerts();
  };

  if (loading) {
    return (
      <Card className="holographic-card">
        <CardContent className="p-6">
          <div className="text-center text-quantum-cyan">Loading performance alerts...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="holographic-card">
      <CardHeader>
        <CardTitle className="text-quantum-cyan">Performance Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Driver</TableHead>
              <TableHead>Alert Type</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert: any) => (
              <TableRow key={alert.id}>
                <TableCell>
                  {alert.delivery_users?.first_name} {alert.delivery_users?.last_name}
                </TableCell>
                <TableCell>{getAlertTypeBadge(alert.alert_type)}</TableCell>
                <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                <TableCell className="max-w-xs truncate">{alert.title}</TableCell>
                <TableCell>
                  {new Date(alert.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAlert(alert)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Resolve Performance Alert</DialogTitle>
                      </DialogHeader>
                      {selectedAlert && (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium">Alert Details</h4>
                            <div className="space-y-2">
                              <div className="flex space-x-2">
                                {getAlertTypeBadge(alert.alert_type)}
                                {getSeverityBadge(alert.severity)}
                              </div>
                              <p className="font-medium">{alert.title}</p>
                              <p className="text-sm text-gray-600">{alert.description}</p>
                            </div>
                          </div>

                          {alert.threshold_value && alert.actual_value && (
                            <div>
                              <h4 className="font-medium">Metrics</h4>
                              <p className="text-sm">
                                Threshold: {alert.threshold_value} | Actual: {alert.actual_value}
                              </p>
                            </div>
                          )}

                          <div>
                            <h4 className="font-medium">Driver</h4>
                            <p>{alert.delivery_users?.first_name} {alert.delivery_users?.last_name}</p>
                            <p className="text-sm text-gray-600">{alert.delivery_users?.phone}</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Resolution Notes
                            </label>
                            <Textarea
                              value={resolutionNotes}
                              onChange={(e) => setResolutionNotes(e.target.value)}
                              placeholder="Describe how this alert was resolved..."
                            />
                          </div>

                          <Button
                            onClick={() => handleResolve(alert)}
                            className="w-full"
                            disabled={!resolutionNotes.trim()}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Resolve Alert
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {alerts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No active performance alerts
          </div>
        )}
      </CardContent>
    </Card>
  );
};
