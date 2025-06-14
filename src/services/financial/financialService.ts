import { supabase } from '@/integrations/supabase/client';
import type {
  PaymentMethod,
  FinancialTransaction,
  RestaurantEarnings,
  Payout,
  FinancialReport,
  CommissionStructure,
  BankAccount,
} from '@/types/financial';

// --- Minimal interfaces matching Supabase rows --- //

interface DBPaymentMethod {
  id: string;
  payment_methods_user_id: string;
  type: PaymentMethod['type'];
  provider: string;
  external_id: string;
  last_four?: string | null;
  brand?: string | null;
  expires_month?: number | null;
  expires_year?: number | null;
  is_default: boolean | null;
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

interface DBFinancialTransaction {
  id: string;
  order_id?: string | null;
  financial_transactions_user_id: string;
  restaurant_id?: string | null;
  delivery_user_id?: string | null;
  transaction_type: FinancialTransaction['transaction_type'];
  amount: number;
  currency: string;
  status: FinancialTransaction['status'];
  payment_method_id?: string | null;
  external_transaction_id?: string | null;
  provider: string;
  provider_fee: number;
  platform_commission: number;
  net_amount?: number | null;
  description?: string | null;
  metadata: string | null;
  processed_at?: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface DBRestaurantEarnings {
  id: string;
  restaurant_id: string;
  order_id?: string | null;
  transaction_id?: string | null;
  gross_amount: number;
  platform_commission: number;
  payment_processing_fee: number;
  net_earnings: number;
  commission_rate: number;
  status: RestaurantEarnings['status'];
  payout_id?: string | null;
  earned_at: string | null;
  available_at?: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface DBPayout {
  id: string;
  restaurant_id?: string | null;
  delivery_user_id?: string | null;
  payout_method: Payout['payout_method'];
  amount: number;
  currency: string;
  status: Payout['status'];
  external_payout_id?: string | null;
  provider: string;
  provider_fee: number;
  net_amount?: number | null;
  earnings_count: number;
  period_start: string;
  period_end: string;
  scheduled_date?: string | null;
  processed_at?: string | null;
  failure_reason?: string | null;
  metadata: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface DBFinancialReport {
  id: string;
  restaurant_id?: string | null;
  report_type: FinancialReport['report_type'];
  period_start: string;
  period_end: string;
  total_orders: number;
  gross_revenue: number;
  net_revenue: number;
  total_commission: number;
  total_fees: number;
  total_refunds: number;
  average_order_value: number;
  commission_rate?: number | null;
  payment_methods_breakdown: string | null;
  top_selling_items: string | null;
  generated_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface DBCommissionStructure {
  id: string;
  restaurant_id?: string | null;
  name: string;
  commission_rate: number;
  payment_processing_rate: number;
  fixed_fee: number;
  minimum_order_value: number;
  is_active: boolean;
  effective_from: string;
  effective_until?: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface DBBankAccount {
  id: string;
  restaurant_id?: string | null;
  delivery_user_id?: string | null;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  routing_number: string;
  account_type: BankAccount['account_type'];
  is_verified: boolean;
  is_default: boolean;
  external_account_id?: string | null;
  verification_status: string;
  created_at: string | null;
  updated_at: string | null;
}

// --- Service methods --- //

export const financialService = {
  // Get payment methods for a user
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('payment_methods_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting payment methods:', error);
      return [];
    }

    // Map DB fields to PaymentMethod
    return (data as DBPaymentMethod[]).map((pm) => ({
      id: pm.id,
      user_id: pm.payment_methods_user_id,
      type: pm.type,
      provider: pm.provider,
      external_id: pm.external_id,
      last_four: pm.last_four ?? undefined,
      brand: pm.brand ?? undefined,
      expires_month: pm.expires_month ?? undefined,
      expires_year: pm.expires_year ?? undefined,
      is_default: pm.is_default ?? false,
      is_active: pm.is_active ?? true,
      created_at: pm.created_at ?? '',
      updated_at: pm.updated_at ?? '',
    }));
  },

  // Add a new payment method for a user
  async addPaymentMethod(userId: string, method: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<PaymentMethod | null> {
    const now = new Date().toISOString();
    const dbInsert: Omit<DBPaymentMethod, 'id'> = {
      payment_methods_user_id: userId,
      type: method.type,
      provider: method.provider,
      external_id: method.external_id,
      last_four: method.last_four ?? null,
      brand: method.brand ?? null,
      expires_month: method.expires_month ?? null,
      expires_year: method.expires_year ?? null,
      is_default: method.is_default ?? false,
      is_active: method.is_active ?? true,
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await supabase
      .from('payment_methods')
      .insert([dbInsert])
      .select()
      .single();
    if (error) {
      console.error('Error adding payment method:', error);
      return null;
    }
    const pm = data as DBPaymentMethod;
    return {
      id: pm.id,
      user_id: pm.payment_methods_user_id,
      type: pm.type,
      provider: pm.provider,
      external_id: pm.external_id,
      last_four: pm.last_four ?? undefined,
      brand: pm.brand ?? undefined,
      expires_month: pm.expires_month ?? undefined,
      expires_year: pm.expires_year ?? undefined,
      is_default: pm.is_default ?? false,
      is_active: pm.is_active ?? true,
      created_at: pm.created_at ?? '',
      updated_at: pm.updated_at ?? '',
    };
  },

  // Get transactions for a restaurant
  async getTransactions({
    restaurantId,
    limit = 20,
  }: { restaurantId: string; limit?: number }): Promise<FinancialTransaction[]> {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting financial transactions:', error);
      return [];
    }

    return (data as DBFinancialTransaction[]).map((ft) => ({
      id: ft.id,
      order_id: ft.order_id ?? undefined,
      user_id: ft.financial_transactions_user_id,
      restaurant_id: ft.restaurant_id ?? undefined,
      delivery_user_id: ft.delivery_user_id ?? undefined,
      transaction_type: ft.transaction_type,
      amount: ft.amount,
      currency: ft.currency,
      status: ft.status,
      payment_method_id: ft.payment_method_id ?? undefined,
      external_transaction_id: ft.external_transaction_id ?? undefined,
      provider: ft.provider,
      provider_fee: ft.provider_fee,
      platform_commission: ft.platform_commission,
      net_amount: ft.net_amount ?? undefined,
      description: ft.description ?? undefined,
      metadata: ft.metadata ? JSON.parse(ft.metadata) : {},
      processed_at: ft.processed_at ?? undefined,
      created_at: ft.created_at ?? '',
      updated_at: ft.updated_at ?? '',
    }));
  },

  // Get restaurant earnings
  async getRestaurantEarnings(restaurantId: string, { limit = 20 }: { limit?: number }): Promise<RestaurantEarnings[]> {
    const { data, error } = await supabase
      .from('restaurant_earnings')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('earned_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting restaurant earnings:', error);
      return [];
    }

    return (data as DBRestaurantEarnings[]).map((re) => ({
      id: re.id,
      restaurant_id: re.restaurant_id,
      order_id: re.order_id ?? undefined,
      transaction_id: re.transaction_id ?? undefined,
      gross_amount: re.gross_amount,
      platform_commission: re.platform_commission,
      payment_processing_fee: re.payment_processing_fee,
      net_earnings: re.net_earnings,
      commission_rate: re.commission_rate,
      status: re.status,
      payout_id: re.payout_id ?? undefined,
      earned_at: re.earned_at ?? '',
      available_at: re.available_at ?? undefined,
      created_at: re.created_at ?? '',
      updated_at: re.updated_at ?? '',
    }));
  },

  // Get payouts
  async getPayouts({ restaurantId, limit = 10 }: { restaurantId: string; limit?: number }): Promise<Payout[]> {
    const { data, error } = await supabase
      .from('payouts')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('scheduled_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting payouts:', error);
      return [];
    }

    return (data as DBPayout[]).map((p) => ({
      id: p.id,
      restaurant_id: p.restaurant_id ?? undefined,
      delivery_user_id: p.delivery_user_id ?? undefined,
      payout_method: p.payout_method,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      external_payout_id: p.external_payout_id ?? undefined,
      provider: p.provider,
      provider_fee: p.provider_fee,
      net_amount: p.net_amount ?? undefined,
      earnings_count: p.earnings_count,
      period_start: p.period_start,
      period_end: p.period_end,
      scheduled_date: p.scheduled_date ?? undefined,
      processed_at: p.processed_at ?? undefined,
      failure_reason: p.failure_reason ?? undefined,
      metadata: p.metadata ? JSON.parse(p.metadata) : {},
      created_at: p.created_at ?? '',
      updated_at: p.updated_at ?? '',
    }));
  },

  // Get financial reports
  async getFinancialReports(restaurantId: string, limit: number): Promise<FinancialReport[]> {
    const { data, error } = await supabase
      .from('financial_reports')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('period_end', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting financial reports:', error);
      return [];
    }

    return (data as DBFinancialReport[]).map((fr) => ({
      id: fr.id,
      restaurant_id: fr.restaurant_id ?? undefined,
      report_type: fr.report_type,
      period_start: fr.period_start,
      period_end: fr.period_end,
      total_orders: fr.total_orders,
      gross_revenue: fr.gross_revenue,
      net_revenue: fr.net_revenue,
      total_commission: fr.total_commission,
      total_fees: fr.total_fees,
      total_refunds: fr.total_refunds,
      average_order_value: fr.average_order_value,
      commission_rate: fr.commission_rate ?? undefined,
      payment_methods_breakdown: fr.payment_methods_breakdown ? JSON.parse(fr.payment_methods_breakdown) : {},
      top_selling_items: fr.top_selling_items ? JSON.parse(fr.top_selling_items) : [],
      generated_at: fr.generated_at ?? '',
      created_at: fr.created_at ?? '',
      updated_at: fr.updated_at ?? '',
    }));
  },

  async getEarningsSummary(restaurantId: string): Promise<{
    totalEarnings: number;
    availableEarnings: number;
    pendingEarnings: number;
    paidEarnings: number;
  }> {
    try {
      const { data, error } = await supabase.rpc('get_restaurant_earnings_summary', {
        p_restaurant_id: restaurantId,
      });

      if (error) {
        console.error('Error getting earnings summary:', error);
        return {
          totalEarnings: 0,
          availableEarnings: 0,
          pendingEarnings: 0,
          paidEarnings: 0,
        };
      }

      return {
        totalEarnings: data?.total_earnings || 0,
        availableEarnings: data?.available_earnings || 0,
        pendingEarnings: data?.pending_earnings || 0,
        paidEarnings: data?.paid_earnings || 0,
      };
    } catch (error) {
      console.error('Error getting earnings summary:', error);
      return {
        totalEarnings: 0,
        availableEarnings: 0,
        pendingEarnings: 0,
        paidEarnings: 0,
      };
    }
  },

  async requestPayout(restaurantId: string): Promise<Payout | null> {
    try {
      const { data, error } = await supabase.rpc('request_restaurant_payout', {
        p_restaurant_id: restaurantId,
      }).select().single();

      if (error) {
        console.error('Error requesting payout:', error);
        return null;
      }

      const payout = data as DBPayout;
      return {
        id: payout.id,
        restaurant_id: payout.restaurant_id ?? undefined,
        delivery_user_id: payout.delivery_user_id ?? undefined,
        payout_method: payout.payout_method,
        amount: payout.amount,
        currency: payout.currency,
        status: payout.status,
        external_payout_id: payout.external_payout_id ?? undefined,
        provider: payout.provider,
        provider_fee: payout.provider_fee,
        net_amount: payout.net_amount ?? undefined,
        earnings_count: payout.earnings_count,
        period_start: payout.period_start,
        period_end: payout.period_end,
        scheduled_date: payout.scheduled_date ?? undefined,
        processed_at: payout.processed_at ?? undefined,
        failure_reason: payout.failure_reason ?? undefined,
        metadata: payout.metadata ? JSON.parse(payout.metadata) : {},
        created_at: payout.created_at ?? '',
        updated_at: payout.updated_at ?? '',
      };
    } catch (error) {
      console.error('Error requesting payout:', error);
      return null;
    }
  },

  async generateFinancialReport(
    restaurantId: string,
    reportType: FinancialReport['report_type'],
    startDate: string,
    endDate: string
  ): Promise<FinancialReport | null> {
    try {
      const { data, error } = await supabase.rpc('generate_financial_report', {
        p_restaurant_id: restaurantId,
        p_report_type: reportType,
        p_period_start: startDate,
        p_period_end: endDate,
      }).select().single();

      if (error) {
        console.error('Error generating financial report:', error);
        return null;
      }

      const report = data as DBFinancialReport;
      return {
        id: report.id,
        restaurant_id: report.restaurant_id ?? undefined,
        report_type: report.report_type,
        period_start: report.period_start,
        period_end: report.period_end,
        total_orders: report.total_orders,
        gross_revenue: report.gross_revenue,
        net_revenue: report.net_revenue,
        total_commission: report.total_commission,
        total_fees: report.total_fees,
        total_refunds: report.total_refunds,
        average_order_value: report.average_order_value,
        commission_rate: report.commission_rate ?? undefined,
        payment_methods_breakdown: report.payment_methods_breakdown ? JSON.parse(report.payment_methods_breakdown) : {},
        top_selling_items: report.top_selling_items ? JSON.parse(report.top_selling_items) : [],
        generated_at: report.generated_at ?? '',
        created_at: report.created_at ?? '',
        updated_at: report.updated_at ?? '',
      };
    } catch (error) {
      console.error('Error generating financial report:', error);
      return null;
    }
  },
};
