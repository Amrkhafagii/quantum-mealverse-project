
import React from 'react';
import { toast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const showOrderActionFeedback = {
  success: (action: 'accept' | 'reject', customerName: string) => {
    const isAccept = action === 'accept';
    toast({
      title: isAccept ? 'Order Accepted' : 'Order Rejected',
      description: `Successfully ${action}ed order from ${customerName}`,
      duration: 4000,
      className: isAccept ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50',
    });
  },

  error: (action: 'accept' | 'reject', error: string) => {
    toast({
      title: `Failed to ${action} order`,
      description: error || `An error occurred while trying to ${action} the order. Please try again.`,
      variant: 'destructive',
      duration: 6000,
    });
  },

  networkError: (action: 'accept' | 'reject') => {
    toast({
      title: 'Network Error',
      description: `Unable to ${action} order due to connection issues. Please check your internet and try again.`,
      variant: 'destructive',
      duration: 8000,
    });
  },

  validationError: (message: string) => {
    toast({
      title: 'Validation Error',
      description: message,
      variant: 'destructive',
      duration: 5000,
    });
  }
};
