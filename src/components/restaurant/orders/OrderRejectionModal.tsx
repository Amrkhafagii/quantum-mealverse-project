
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertTriangle, Clock, Wrench, Package } from 'lucide-react';

interface OrderRejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReject: (reason: string, details?: string) => Promise<void>;
  orderInfo: {
    id: string;
    customer_name: string;
    total: number;
  };
}

const REJECTION_REASONS = [
  {
    value: 'missing_ingredients',
    label: 'Missing Ingredients',
    icon: Package,
    description: 'Required ingredients are not available'
  },
  {
    value: 'too_busy',
    label: 'Too Busy',
    icon: Clock,
    description: 'Kitchen is at capacity and cannot handle more orders'
  },
  {
    value: 'equipment_issues',
    label: 'Equipment Issues',
    icon: Wrench,
    description: 'Kitchen equipment is not functioning properly'
  },
  {
    value: 'other',
    label: 'Other',
    icon: AlertTriangle,
    description: 'Other reason (please specify)'
  }
];

export const OrderRejectionModal: React.FC<OrderRejectionModalProps> = ({
  isOpen,
  onClose,
  onReject,
  orderInfo
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [rejectionDetails, setRejectionDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setIsSubmitting(true);
    try {
      const reasonData = REJECTION_REASONS.find(r => r.value === selectedReason);
      const reason = reasonData?.label || selectedReason;
      
      await onReject(reason, rejectionDetails || undefined);
      onClose();
      setSelectedReason('');
      setRejectionDetails('');
    } catch (error) {
      console.error('Error rejecting order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedReasonData = REJECTION_REASONS.find(r => r.value === selectedReason);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Reject Order #{orderInfo.id.slice(-8)}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Customer: {orderInfo.customer_name}</p>
            <p className="text-sm text-gray-600">Total: ${orderInfo.total.toFixed(2)}</p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="rejection-reason">Reason for rejection:</Label>
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              {REJECTION_REASONS.map((reason) => {
                const IconComponent = reason.icon;
                return (
                  <div key={reason.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={reason.value} id={reason.value} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-gray-500" />
                        <Label htmlFor={reason.value} className="font-medium cursor-pointer">
                          {reason.label}
                        </Label>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{reason.description}</p>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {(selectedReason === 'other' || selectedReason) && (
            <div className="space-y-2">
              <Label htmlFor="rejection-details">
                {selectedReason === 'other' ? 'Please specify the reason:' : 'Additional details (optional):'}
              </Label>
              <Textarea
                id="rejection-details"
                placeholder={selectedReasonData?.value === 'other' 
                  ? 'Please provide details about why you cannot accept this order...'
                  : 'Any additional information about the rejection...'
                }
                value={rejectionDetails}
                onChange={(e) => setRejectionDetails(e.target.value)}
                rows={3}
                required={selectedReason === 'other'}
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmit}
              disabled={!selectedReason || isSubmitting || (selectedReason === 'other' && !rejectionDetails.trim())}
              className="flex-1"
            >
              {isSubmitting ? 'Rejecting...' : 'Reject Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
