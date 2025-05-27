
export interface PaymentMethod {
  id: string;
  user_id: string;
  type: 'credit_card' | 'debit_card' | 'bank_account' | 'digital_wallet';
  provider: string;
  external_id: string;
  last_four?: string;
  brand?: string;
  expires_month?: number;
  expires_year?: number;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinancialTransaction {
  id: string;
  order_id?: string;
  user_id: string;
  restaurant_id?: string;
  delivery_user_id?: string;
  transaction_type: 'payment' | 'refund' | 'payout' | 'commission' | 'fee';
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payment_method_id?: string;
  external_transaction_id?: string;
  provider: string;
  provider_fee: number;
  platform_commission: number;
  net_amount?: number;
  description?: string;
  metadata: Record<string, any>;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RestaurantEarnings {
  id: string;
  restaurant_id: string;
  order_id?: string;
  transaction_id?: string;
  gross_amount: number;
  platform_commission: number;
  payment_processing_fee: number;
  net_earnings: number;
  commission_rate: number;
  status: 'pending' | 'available' | 'paid' | 'on_hold';
  payout_id?: string;
  earned_at: string;
  available_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Payout {
  id: string;
  restaurant_id?: string;
  delivery_user_id?: string;
  payout_method: 'bank_transfer' | 'stripe_express' | 'paypal' | 'check';
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  external_payout_id?: string;
  provider: string;
  provider_fee: number;
  net_amount?: number;
  earnings_count: number;
  period_start: string;
  period_end: string;
  scheduled_date?: string;
  processed_at?: string;
  failure_reason?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CommissionStructure {
  id: string;
  restaurant_id?: string;
  name: string;
  commission_rate: number;
  payment_processing_rate: number;
  fixed_fee: number;
  minimum_order_value: number;
  is_active: boolean;
  effective_from: string;
  effective_until?: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialReport {
  id: string;
  restaurant_id?: string;
  report_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  period_start: string;
  period_end: string;
  total_orders: number;
  gross_revenue: number;
  net_revenue: number;
  total_commission: number;
  total_fees: number;
  total_refunds: number;
  average_order_value: number;
  commission_rate?: number;
  payment_methods_breakdown: Record<string, any>;
  top_selling_items: any[];
  generated_at: string;
  created_at: string;
}

export interface BankAccount {
  id: string;
  restaurant_id?: string;
  delivery_user_id?: string;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  routing_number: string;
  account_type: 'checking' | 'savings';
  is_verified: boolean;
  is_default: boolean;
  external_account_id?: string;
  verification_status: 'pending' | 'verified' | 'failed';
  created_at: string;
  updated_at: string;
}
