
export interface PaymentTransaction {
  id: string;
  order_id: string;
  customer_id: string;
  restaurant_id?: string;
  delivery_user_id?: string;
  transaction_type: 'order_payment' | 'tip' | 'refund' | 'commission' | 'driver_payout';
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  payment_method: 'cash' | 'visa' | 'digital_wallet' | 'bank_transfer';
  external_transaction_id?: string;
  payment_processor?: string;
  processed_at?: string;
  failure_reason?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PaymentConfirmation {
  id: string;
  payment_transaction_id: string;
  order_id: string;
  confirming_party: 'customer' | 'restaurant' | 'driver' | 'system';
  confirming_user_id?: string;
  confirmation_status: 'pending' | 'confirmed' | 'disputed' | 'timeout';
  confirmation_method?: 'app' | 'sms' | 'email' | 'automatic';
  confirmed_at?: string;
  dispute_reason?: string;
  timeout_at: string;
  created_at: string;
}

export interface TipDistribution {
  id: string;
  order_id: string;
  payment_transaction_id?: string;
  total_tip_amount: number;
  delivery_user_id: string;
  driver_tip_amount: number;
  driver_tip_percentage: number;
  platform_fee_amount: number;
  restaurant_tip_amount: number;
  distribution_status: 'pending' | 'distributed' | 'failed' | 'reversed';
  distributed_at?: string;
  failure_reason?: string;
  created_at: string;
}

export interface PaymentStatusCoordination {
  id: string;
  order_id: string;
  overall_payment_status: 'pending' | 'partial' | 'completed' | 'failed' | 'disputed' | 'refunded';
  base_payment_status: string;
  tip_payment_status: string;
  confirmation_status: string;
  all_parties_confirmed: boolean;
  requires_manual_review: boolean;
  last_status_update: string;
  status_history: Array<{
    timestamp: string;
    status: string;
    action: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface PaymentNotification {
  id: string;
  order_id: string;
  recipient_id: string;
  recipient_type: 'customer' | 'restaurant' | 'driver';
  notification_type: 'payment_received' | 'payment_confirmed' | 'tip_received' | 'payment_failed' | 'refund_processed';
  title: string;
  message: string;
  amount?: number;
  is_read: boolean;
  sent_at: string;
  read_at?: string;
  created_at: string;
}

export interface PaymentFlowState {
  coordination: PaymentStatusCoordination | null;
  transactions: PaymentTransaction[];
  confirmations: PaymentConfirmation[];
  tipDistributions: TipDistribution[];
  notifications: PaymentNotification[];
  loading: boolean;
  error: string | null;
}

export interface ProcessPaymentRequest {
  orderId: string;
  customerId: string;
  transactionType: PaymentTransaction['transaction_type'];
  amount: number;
  paymentMethod: PaymentTransaction['payment_method'];
  externalTransactionId?: string;
}

export interface ConfirmPaymentRequest {
  confirmationId: string;
  confirmingUserId: string;
  confirmationMethod?: PaymentConfirmation['confirmation_method'];
}

export interface ProcessTipRequest {
  orderId: string;
  totalTipAmount: number;
  driverTipPercentage?: number;
}
