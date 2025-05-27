
import { supabase } from '@/integrations/supabase/client';
import { fromSupabaseJson, toSupabaseJson } from '@/utils/supabaseUtils';
import type { 
  PaymentMethod, 
  FinancialTransaction, 
  RestaurantEarnings, 
  Payout, 
  CommissionStructure, 
  FinancialReport,
  BankAccount 
} from '@/types/financial';

export class FinancialService {
  // Payment Methods
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      type: item.type as PaymentMethod['type']
    }));
  }

  async addPaymentMethod(paymentMethod: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentMethod> {
    const { data, error } = await supabase
      .from('payment_methods')
      .insert(paymentMethod)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      type: data.type as PaymentMethod['type']
    };
  }

  async setDefaultPaymentMethod(paymentMethodId: string, userId: string): Promise<void> {
    // First, unset all other defaults
    await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Then set the new default
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', paymentMethodId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_active: false })
      .eq('id', paymentMethodId);

    if (error) throw error;
  }

  // Financial Transactions
  async getTransactions(filters: {
    userId?: string;
    restaurantId?: string;
    orderId?: string;
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<FinancialTransaction[]> {
    let query = supabase
      .from('financial_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.userId) query = query.eq('user_id', filters.userId);
    if (filters.restaurantId) query = query.eq('restaurant_id', filters.restaurantId);
    if (filters.orderId) query = query.eq('order_id', filters.orderId);
    if (filters.type) query = query.eq('transaction_type', filters.type);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.limit) query = query.limit(filters.limit);
    if (filters.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      transaction_type: item.transaction_type as FinancialTransaction['transaction_type'],
      status: item.status as FinancialTransaction['status'],
      metadata: fromSupabaseJson<Record<string, any>>(item.metadata)
    }));
  }

  async createTransaction(transaction: Omit<FinancialTransaction, 'id' | 'created_at' | 'updated_at'>): Promise<FinancialTransaction> {
    const transactionData = {
      ...transaction,
      metadata: toSupabaseJson(transaction.metadata)
    };

    const { data, error } = await supabase
      .from('financial_transactions')
      .insert(transactionData)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      transaction_type: data.transaction_type as FinancialTransaction['transaction_type'],
      status: data.status as FinancialTransaction['status'],
      metadata: fromSupabaseJson<Record<string, any>>(data.metadata)
    };
  }

  // Restaurant Earnings
  async getRestaurantEarnings(restaurantId: string, filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<RestaurantEarnings[]> {
    let query = supabase
      .from('restaurant_earnings')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('earned_at', { ascending: false });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.startDate) query = query.gte('earned_at', filters.startDate);
    if (filters?.endDate) query = query.lte('earned_at', filters.endDate);
    if (filters?.limit) query = query.limit(filters.limit);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      status: item.status as RestaurantEarnings['status']
    }));
  }

  async getEarningsSummary(restaurantId: string): Promise<{
    totalEarnings: number;
    availableEarnings: number;
    pendingEarnings: number;
    paidEarnings: number;
  }> {
    const { data, error } = await supabase
      .from('restaurant_earnings')
      .select('status, net_earnings')
      .eq('restaurant_id', restaurantId);

    if (error) throw error;

    const summary = (data || []).reduce((acc, earning) => {
      acc.totalEarnings += earning.net_earnings;
      switch (earning.status) {
        case 'available':
          acc.availableEarnings += earning.net_earnings;
          break;
        case 'pending':
          acc.pendingEarnings += earning.net_earnings;
          break;
        case 'paid':
          acc.paidEarnings += earning.net_earnings;
          break;
      }
      return acc;
    }, {
      totalEarnings: 0,
      availableEarnings: 0,
      pendingEarnings: 0,
      paidEarnings: 0
    });

    return summary;
  }

  // Payouts
  async getPayouts(filters: {
    restaurantId?: string;
    deliveryUserId?: string;
    status?: string;
    limit?: number;
  }): Promise<Payout[]> {
    let query = supabase
      .from('payouts')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.restaurantId) query = query.eq('restaurant_id', filters.restaurantId);
    if (filters.deliveryUserId) query = query.eq('delivery_user_id', filters.deliveryUserId);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.limit) query = query.limit(filters.limit);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      payout_method: item.payout_method as Payout['payout_method'],
      status: item.status as Payout['status'],
      metadata: fromSupabaseJson<Record<string, any>>(item.metadata)
    }));
  }

  async createPayout(payout: Omit<Payout, 'id' | 'created_at' | 'updated_at'>): Promise<Payout> {
    // Ensure we have the required fields for the database
    const payoutData = {
      restaurant_id: payout.restaurant_id || null,
      delivery_user_id: payout.delivery_user_id || null,
      payout_method: payout.payout_method,
      amount: payout.amount,
      currency: payout.currency,
      status: payout.status,
      external_payout_id: payout.external_payout_id || null,
      provider: payout.provider,
      provider_fee: payout.provider_fee,
      net_amount: payout.net_amount || null,
      earnings_count: payout.earnings_count,
      period_start: payout.period_start,
      period_end: payout.period_end,
      scheduled_date: payout.scheduled_date || null,
      processed_at: payout.processed_at || null,
      failure_reason: payout.failure_reason || null,
      metadata: toSupabaseJson(payout.metadata)
    };

    const { data, error } = await supabase
      .from('payouts')
      .insert(payoutData)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      payout_method: data.payout_method as Payout['payout_method'],
      status: data.status as Payout['status'],
      metadata: fromSupabaseJson<Record<string, any>>(data.metadata)
    };
  }

  async requestPayout(restaurantId: string): Promise<Payout> {
    // Get available earnings
    const availableEarnings = await this.getRestaurantEarnings(restaurantId, { status: 'available' });
    
    if (availableEarnings.length === 0) {
      throw new Error('No available earnings to payout');
    }

    const totalAmount = availableEarnings.reduce((sum, earning) => sum + earning.net_earnings, 0);
    const periodStart = availableEarnings[availableEarnings.length - 1].earned_at;
    const periodEnd = availableEarnings[0].earned_at;

    // Create payout
    const payout = await this.createPayout({
      restaurant_id: restaurantId,
      payout_method: 'stripe_express',
      amount: totalAmount,
      currency: 'USD',
      status: 'pending',
      provider: 'stripe',
      provider_fee: totalAmount * 0.01, // 1% provider fee
      net_amount: totalAmount * 0.99,
      earnings_count: availableEarnings.length,
      period_start: periodStart.split('T')[0],
      period_end: periodEnd.split('T')[0],
      metadata: {}
    });

    // Update earnings status to paid
    await supabase
      .from('restaurant_earnings')
      .update({ 
        status: 'paid',
        payout_id: payout.id
      })
      .in('id', availableEarnings.map(e => e.id));

    return payout;
  }

  // Commission Structure
  async getCommissionStructure(restaurantId?: string): Promise<CommissionStructure | null> {
    let query = supabase
      .from('commission_structures')
      .select('*')
      .eq('is_active', true)
      .order('restaurant_id', { ascending: false }) // Restaurant-specific first
      .order('effective_from', { ascending: false });

    if (restaurantId) {
      query = query.or(`restaurant_id.eq.${restaurantId},restaurant_id.is.null`);
    } else {
      query = query.is('restaurant_id', null);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data?.[0] || null;
  }

  // Financial Reports
  async generateFinancialReport(
    restaurantId: string,
    reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom',
    periodStart: string,
    periodEnd: string
  ): Promise<FinancialReport> {
    // Get earnings data for the period
    const earnings = await this.getRestaurantEarnings(restaurantId, {
      startDate: periodStart,
      endDate: periodEnd
    });

    // Get transactions for payment method breakdown
    const transactions = await this.getTransactions({
      restaurantId,
      type: 'payment'
    });

    // Calculate metrics
    const totalOrders = earnings.length;
    const grossRevenue = earnings.reduce((sum, e) => sum + e.gross_amount, 0);
    const netRevenue = earnings.reduce((sum, e) => sum + e.net_earnings, 0);
    const totalCommission = earnings.reduce((sum, e) => sum + e.platform_commission, 0);
    const totalFees = earnings.reduce((sum, e) => sum + e.payment_processing_fee, 0);
    const averageOrderValue = totalOrders > 0 ? grossRevenue / totalOrders : 0;
    const averageCommissionRate = totalOrders > 0 ? 
      earnings.reduce((sum, e) => sum + e.commission_rate, 0) / totalOrders : 0;

    // Payment methods breakdown
    const paymentMethodsBreakdown = transactions.reduce((acc, transaction) => {
      const provider = transaction.provider || 'unknown';
      acc[provider] = (acc[provider] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    const reportData = {
      restaurant_id: restaurantId,
      report_type: reportType,
      period_start: periodStart,
      period_end: periodEnd,
      total_orders: totalOrders,
      gross_revenue: grossRevenue,
      net_revenue: netRevenue,
      total_commission: totalCommission,
      total_fees: totalFees,
      total_refunds: 0, // TODO: Calculate refunds
      average_order_value: averageOrderValue,
      commission_rate: averageCommissionRate,
      payment_methods_breakdown: toSupabaseJson(paymentMethodsBreakdown),
      top_selling_items: toSupabaseJson([]), // TODO: Calculate top selling items
      generated_at: new Date().toISOString()
    };

    // Save report to database
    const { data, error } = await supabase
      .from('financial_reports')
      .insert(reportData)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      report_type: data.report_type as FinancialReport['report_type'],
      payment_methods_breakdown: fromSupabaseJson<Record<string, any>>(data.payment_methods_breakdown),
      top_selling_items: fromSupabaseJson<any[]>(data.top_selling_items)
    };
  }

  async getFinancialReports(restaurantId: string, limit = 10): Promise<FinancialReport[]> {
    const { data, error } = await supabase
      .from('financial_reports')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('generated_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      report_type: item.report_type as FinancialReport['report_type'],
      payment_methods_breakdown: fromSupabaseJson<Record<string, any>>(item.payment_methods_breakdown),
      top_selling_items: fromSupabaseJson<any[]>(item.top_selling_items)
    }));
  }

  // Bank Accounts
  async getBankAccounts(restaurantId?: string, deliveryUserId?: string): Promise<BankAccount[]> {
    let query = supabase
      .from('bank_accounts')
      .select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (restaurantId) query = query.eq('restaurant_id', restaurantId);
    if (deliveryUserId) query = query.eq('delivery_user_id', deliveryUserId);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      account_type: item.account_type as BankAccount['account_type'],
      verification_status: item.verification_status as BankAccount['verification_status']
    }));
  }

  async addBankAccount(bankAccount: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>): Promise<BankAccount> {
    const { data, error } = await supabase
      .from('bank_accounts')
      .insert(bankAccount)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      account_type: data.account_type as BankAccount['account_type'],
      verification_status: data.verification_status as BankAccount['verification_status']
    };
  }

  async setDefaultBankAccount(bankAccountId: string, restaurantId?: string, deliveryUserId?: string): Promise<void> {
    // First, unset all other defaults
    let updateQuery = supabase
      .from('bank_accounts')
      .update({ is_default: false });

    if (restaurantId) updateQuery = updateQuery.eq('restaurant_id', restaurantId);
    if (deliveryUserId) updateQuery = updateQuery.eq('delivery_user_id', deliveryUserId);

    await updateQuery;

    // Then set the new default
    const { error } = await supabase
      .from('bank_accounts')
      .update({ is_default: true })
      .eq('id', bankAccountId);

    if (error) throw error;
  }
}

export const financialService = new FinancialService();
