
import { useState, useEffect, useCallback } from 'react';
import { paymentFlowService } from '@/services/payment/paymentFlowService';
import {
  PaymentFlowState,
  ProcessPaymentRequest,
  ConfirmPaymentRequest,
  ProcessTipRequest
} from '@/types/payment-flow';
import { toast } from '@/hooks/use-toast';

export function usePaymentFlow(orderId?: string) {
  const [state, setState] = useState<PaymentFlowState>({
    coordination: null,
    transactions: [],
    confirmations: [],
    tipDistributions: [],
    notifications: [],
    loading: false,
    error: null
  });

  // Load payment data for an order
  const loadPaymentData = useCallback(async () => {
    if (!orderId) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [coordination, transactions, confirmations, tipDistributions] = await Promise.all([
        paymentFlowService.getPaymentStatus(orderId),
        paymentFlowService.getPaymentTransactions(orderId),
        paymentFlowService.getPaymentConfirmations(orderId),
        paymentFlowService.getTipDistributions(orderId)
      ]);

      setState(prev => ({
        ...prev,
        coordination,
        transactions,
        confirmations,
        tipDistributions,
        loading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load payment data';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      console.error('Error loading payment data:', error);
    }
  }, [orderId]);

  // Process payment
  const processPayment = useCallback(async (request: ProcessPaymentRequest): Promise<string | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const transactionId = await paymentFlowService.processPayment(request);
      
      toast({
        title: 'Payment Processing',
        description: 'Your payment is being processed'
      });

      // Reload data to get updated state
      await loadPaymentData();
      
      return transactionId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process payment';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      
      toast({
        title: 'Payment Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      
      return null;
    }
  }, [loadPaymentData]);

  // Confirm payment
  const confirmPayment = useCallback(async (request: ConfirmPaymentRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const success = await paymentFlowService.confirmPayment(request);
      
      if (success) {
        toast({
          title: 'Payment Confirmed',
          description: 'Your payment confirmation has been recorded'
        });
        
        // Reload data to get updated state
        await loadPaymentData();
      }
      
      setState(prev => ({ ...prev, loading: false }));
      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to confirm payment';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      
      toast({
        title: 'Confirmation Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      
      return false;
    }
  }, [loadPaymentData]);

  // Process tip
  const processTip = useCallback(async (request: ProcessTipRequest): Promise<string | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const distributionId = await paymentFlowService.processTip(request);
      
      toast({
        title: 'Tip Processed',
        description: `Tip of $${request.totalTipAmount} has been distributed`
      });

      // Reload data to get updated state
      await loadPaymentData();
      
      return distributionId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process tip';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      
      toast({
        title: 'Tip Processing Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      
      return null;
    }
  }, [loadPaymentData]);

  // Load initial data
  useEffect(() => {
    if (orderId) {
      loadPaymentData();
    }
  }, [orderId, loadPaymentData]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!orderId) return;

    const unsubscribe = paymentFlowService.subscribeToPaymentStatus(
      orderId,
      (coordination) => {
        setState(prev => ({ ...prev, coordination }));
      },
      (error) => {
        console.error('Payment status subscription error:', error);
      }
    );

    return unsubscribe;
  }, [orderId]);

  return {
    ...state,
    processPayment,
    confirmPayment,
    processTip,
    refreshData: loadPaymentData
  };
}
