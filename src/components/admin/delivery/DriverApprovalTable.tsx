
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
import { CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import { deliveryManagementService } from '@/services/admin/deliveryManagementService';
import type { DriverApprovalWorkflow } from '@/types/admin';

interface DriverApprovalTableProps {
  onApprove: (id: string, notes?: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}

export const DriverApprovalTable: React.FC<DriverApprovalTableProps> = ({
  onApprove,
  onReject
}) => {
  const [approvals, setApprovals] = useState<DriverApprovalWorkflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<DriverApprovalWorkflow | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const data = await deliveryManagementService.getDriverApprovals();
      setApprovals(data);
    } catch (error) {
      console.error('Error loading approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'default',
      reviewing: 'secondary', 
      approved: 'default',
      rejected: 'destructive',
      suspended: 'destructive'
    } as const;

    const colors = {
      pending: 'text-yellow-500',
      reviewing: 'text-blue-500',
      approved: 'text-green-500', 
      rejected: 'text-red-500',
      suspended: 'text-red-500'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        <span className={colors[status as keyof typeof colors] || ''}>
          {status.replace('_', ' ').toUpperCase()}
        </span>
      </Badge>
    );
  };

  const getStageBadge = (stage: string) => {
    const stageLabels = {
      documents: 'Documents Review',
      background_check: 'Background Check',
      vehicle_inspection: 'Vehicle Inspection',
      final_approval: 'Final Approval'
    };

    return (
      <Badge variant="outline">
        {stageLabels[stage as keyof typeof stageLabels] || stage}
      </Badge>
    );
  };

  const handleApprove = async (approval: DriverApprovalWorkflow) => {
    await onApprove(approval.id, reviewNotes);
    setReviewNotes('');
    setSelectedApproval(null);
    loadApprovals();
  };

  const handleReject = async (approval: DriverApprovalWorkflow) => {
    if (!rejectionReason.trim()) return;
    await onReject(approval.id, rejectionReason);
    setRejectionReason('');
    setSelectedApproval(null);
    loadApprovals();
  };

  if (loading) {
    return (
      <Card className="holographic-card">
        <CardContent className="p-6">
          <div className="text-center text-quantum-cyan">Loading driver approvals...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="holographic-card">
      <CardHeader>
        <CardTitle className="text-quantum-cyan">Driver Approval Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Driver Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approvals.map((approval: any) => (
              <TableRow key={approval.id}>
                <TableCell>
                  {approval.delivery_users?.first_name} {approval.delivery_users?.last_name}
                </TableCell>
                <TableCell>{approval.delivery_users?.phone}</TableCell>
                <TableCell>{getStatusBadge(approval.status)}</TableCell>
                <TableCell>{getStageBadge(approval.stage)}</TableCell>
                <TableCell>
                  {new Date(approval.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApproval(approval)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Review Driver Application</DialogTitle>
                        </DialogHeader>
                        {selectedApproval && (
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium">Driver Details</h4>
                              <p>{approval.delivery_users?.first_name} {approval.delivery_users?.last_name}</p>
                              <p>{approval.delivery_users?.phone}</p>
                            </div>
                            
                            <div>
                              <h4 className="font-medium">Current Status</h4>
                              <div className="flex space-x-2">
                                {getStatusBadge(approval.status)}
                                {getStageBadge(approval.stage)}
                              </div>
                            </div>

                            {approval.status === 'pending' && (
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Approval Notes (Optional)
                                  </label>
                                  <Textarea
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    placeholder="Add notes for this approval..."
                                  />
                                </div>
                                
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={() => handleApprove(approval)}
                                    className="flex-1"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium mb-2">
                                    Rejection Reason
                                  </label>
                                  <Textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Reason for rejection..."
                                  />
                                  <Button
                                    onClick={() => handleReject(approval)}
                                    variant="destructive"
                                    className="w-full mt-2"
                                    disabled={!rejectionReason.trim()}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            )}

                            {approval.review_notes && (
                              <div>
                                <h4 className="font-medium">Review Notes</h4>
                                <p className="text-sm text-gray-600">{approval.review_notes}</p>
                              </div>
                            )}

                            {approval.rejection_reason && (
                              <div>
                                <h4 className="font-medium text-red-600">Rejection Reason</h4>
                                <p className="text-sm text-red-600">{approval.rejection_reason}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {approvals.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No driver approvals pending
          </div>
        )}
      </CardContent>
    </Card>
  );
};
