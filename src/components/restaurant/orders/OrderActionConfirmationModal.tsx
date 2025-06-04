
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface OrderActionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: 'accept' | 'reject';
  orderTotal: number;
  customerName: string;
  isProcessing: boolean;
}

export const OrderActionConfirmationModal: React.FC<OrderActionConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  orderTotal,
  customerName,
  isProcessing
}) => {
  const isAccept = action === 'accept';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isAccept ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            {isAccept ? 'Accept Order' : 'Reject Order'}
          </DialogTitle>
          <DialogDescription>
            {isAccept ? (
              <>
                Are you sure you want to accept this order from <strong>{customerName}</strong> 
                for <strong>EGP {orderTotal}</strong>?
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-yellow-800">This action cannot be undone</span>
                </div>
                Are you sure you want to reject this order from <strong>{customerName}</strong>?
                This will remove it from your pending assignments.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isProcessing}
            className={isAccept ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>{isAccept ? 'Accept Order' : 'Reject Order'}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
