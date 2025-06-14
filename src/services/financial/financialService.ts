// Minimal type imports for Payment and Bank accounts
import { supabase } from '@/integrations/supabase/client';
import type {
  PaymentMethod,
  FinancialTransaction,
  RestaurantEarnings,
  Payout,
  FinancialReport,
  BankAccount,
} from '@/types/financial';

// Local DB row interfaces
interface DBPaymentMethod {
  id: string;
  payment_methods_user_id: string;
  type: string;
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

interface DBFinancialTransaction {
  id: string;
  financial_transactions_user_id: string;
  order_id?: string;
  user_id?: string; // Some tables have user_id, some don't
  restaurant_id?: string;
  delivery_user_id?: string;
  transaction_type: string;
  amount: number;
  currency: string;
  status: string;
  payment_method_id?: string;
  external_transaction_id?: string;
  provider: string;
  provider_fee: number;
  platform_commission: number;
  net_amount?: number;
  description?: string;
  metadata: any;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

interface DBPayout {
  id: string;
  restaurant_id?: string;
  delivery_user_id?: string;
  payout_method: string;
  amount: number;
  currency: string;
  status: string;
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
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface DBRestaurantEarnings {
  id: string;
  restaurant_id: string;
  order_id?: string;
  transaction_id?: string;
  gross_amount: number;
  platform_commission: number;
  payment_processing_fee: number;
  net_earnings: number;
  commission_rate: number;
  status: string;
  payout_id?: string;
  earned_at: string;
  available_at?: string;
  created_at: string;
  updated_at: string;
}

interface DBFinancialReport {
  id: string;
  restaurant_id?: string;
  report_type: string;
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
  payment_methods_breakdown: any;
  top_selling_items: any[];
  generated_at: string;
  created_at: string;
  updated_at?: string;
}

interface DBBankAccount {
  id: string;
  restaurant_id?: string;
  delivery_user_id?: string;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  routing_number: string;
  account_type: string;
  is_verified: boolean;
  is_default: boolean;
  external_account_id?: string;
  verification_status: string;
  created_at: string;
  updated_at: string;
}

// --- Payment Methods ---

async function getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('payment_methods_user_id', userId);
  if (error || !data) return [];
  return (data as DBPaymentMethod[]).map((pm): PaymentMethod => ({
    ...pm,
    user_id: pm.payment_methods_user_id,
    type: pm.type as PaymentMethod['type'],
  }));
}

async function addPaymentMethod(
  userId: string,
  method: Omit<PaymentMethod, "id" | "created_at" | "updated_at" | "user_id">
): Promise<boolean> {
  const now = new Date().toISOString();
  const result = await supabase
    .from('payment_methods')
    .insert([
      {
        ...method,
        payment_methods_user_id: userId,
        created_at: now,
        updated_at: now,
      },
    ]);
  return !result.error;
}

// --- Bank Accounts ---

async function getBankAccounts(userId: string): Promise<BankAccount[]> {
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('restaurant_id', userId)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as DBBankAccount[]).map((acc): BankAccount => ({
    ...acc,
    restaurant_id: acc.restaurant_id,
    delivery_user_id: acc.delivery_user_id,
    account_holder_name: acc.account_holder_name,
    bank_name: acc.bank_name,
    account_number: acc.account_number,
    routing_number: acc.routing_number,
    account_type: acc.account_type as BankAccount['account_type'],
    is_verified: acc.is_verified,
    is_default: acc.is_default,
    external_account_id: acc.external_account_id,
    verification_status: acc.verification_status as BankAccount['verification_status'],
    created_at: acc.created_at,
    updated_at: acc.updated_at,
  }));
}

async function addBankAccount(
  restaurantId: string,
  bankAccount: Omit<BankAccount, "id" | "created_at" | "updated_at">
): Promise<boolean> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('bank_accounts')
    .insert([
      {
        ...bankAccount,
        restaurant_id: restaurantId,
        created_at: now,
        updated_at: now,
      }
    ]);
  return !error;
}

async function setDefaultBankAccount(
  restaurantId: string,
  bankAccountId: string
): Promise<boolean> {
  // Unset default for all, set for chosen one
  const { error: e1 } = await supabase
    .from('bank_accounts')
    .update({ is_default: false })
    .eq('restaurant_id', restaurantId);
  const { error: e2 } = await supabase
    .from('bank_accounts')
    .update({ is_default: true })
    .eq('id', bankAccountId);
  return !e1 && !e2;
}

// --- Financial Transactions ---

async function getTransactions(params: {
  restaurantId?: string;
  deliveryUserId?: string;
  limit?: number;
}): Promise<FinancialTransaction[]> {
  let query = supabase.from('financial_transactions').select('*');
  if (params.restaurantId)
    query = query.eq('restaurant_id', params.restaurantId);
  if (params.deliveryUserId)
    query = query.eq('delivery_user_id', params.deliveryUserId);
  if (params.limit)
    query = query.limit(params.limit);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as DBFinancialTransaction[]).map((ft: DBFinancialTransaction) => ({
    ...ft,
    user_id: ft.financial_transactions_user_id ?? ft.user_id,
    transaction_type: ft.transaction_type as FinancialTransaction['transaction_type'],
    status: ft.status as FinancialTransaction['status'],
    metadata: ft.metadata ?? {},
  }));
}

// --- Restaurant Earnings ---

async function getRestaurantEarnings(restaurantId: string, params: { limit?: number } = {}): Promise<RestaurantEarnings[]> {
  let query = supabase.from('restaurant_earnings').select('*').eq('restaurant_id', restaurantId);
  if (params.limit)
    query = query.limit(params.limit);
  const { data, error } = await query.order('earned_at', { ascending: false });
  if (error || !data) return [];
  return (data as DBRestaurantEarnings[]).map((e: DBRestaurantEarnings): RestaurantEarnings => ({ ...e }));
}

// --- Payouts ---

async function getPayouts(params: { restaurantId?: string; deliveryUserId?: string; limit?: number }): Promise<Payout[]> {
  let query = supabase.from('payouts').select('*');
  if (params.restaurantId)
    query = query.eq('restaurant_id', params.restaurantId);
  if (params.deliveryUserId)
    query = query.eq('delivery_user_id', params.deliveryUserId);
  if (params.limit)
    query = query.limit(params.limit);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as DBPayout[]).map((p: DBPayout): Payout => ({
    ...p,
    status: p.status as Payout['status'],
    payout_method: p.payout_method as Payout['payout_method'],
    metadata: p.metadata ?? {},
  }));
}

// --- Financial Reports ---

async function getFinancialReports(restaurantId: string, limit = 5): Promise<FinancialReport[]> {
  const { data, error } = await supabase
    .from('financial_reports')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return (data as DBFinancialReport[]).map((r): FinancialReport => ({
    ...r,
    report_type: r.report_type as FinancialReport['report_type'],
  }));
}

// --- Earnings Summary (stub; actual logic may need an RPC) ---
async function getEarningsSummary(restaurantId: string): Promise<{
  totalEarnings: number;
  availableEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
}> {
  // Placeholder: in real app, would use RPC or summary query
  const { data, error } = await supabase
    .from('restaurant_earnings')
    .select('gross_amount, status')
    .eq('restaurant_id', restaurantId);

  if (error || !data) {
    return {
      totalEarnings: 0,
      availableEarnings: 0,
      pendingEarnings: 0,
      paidEarnings: 0,
    };
  }
  let total = 0;
  let available = 0;
  let pending = 0;
  let paid = 0;
  for (const item of data) {
    total += item.gross_amount ?? 0;
    if (item.status === 'available') available += item.gross_amount ?? 0;
    else if (item.status === 'pending') pending += item.gross_amount ?? 0;
    else if (item.status === 'paid') paid += item.gross_amount ?? 0;
  }
  return {
    totalEarnings: total,
    availableEarnings: available,
    pendingEarnings: pending,
    paidEarnings: paid,
  };
}

// --- Generate Report (stub) ---
async function generateFinancialReport(
  restaurantId: string,
  reportType: FinancialReport['report_type'],
  startDate: string,
  endDate: string
): Promise<FinancialReport | null> {
  // This is a stub. Replace with actual database call or RPC if needed.
  // We'll just return the most recent report for now.
  const reports = await getFinancialReports(restaurantId, 1);
  return reports.length > 0 ? reports[0] : null;
}

// --- Payout request (stub) ---
async function requestPayout(restaurantId: string): Promise<Payout | null> {
  // Placeholder for payout logic: return the latest payout as a stub
  const payouts = await getPayouts({ restaurantId, limit: 1 });
  return payouts.length > 0 ? payouts[0] : null;
}

// Export all as a single service object
export const financialService = {
  getPaymentMethods,
  addPaymentMethod,
  getBankAccounts,
  addBankAccount,
  setDefaultBankAccount,
  getTransactions,
  getRestaurantEarnings,
  getPayouts,
  getFinancialReports,
  getEarningsSummary,
  generateFinancialReport,
  requestPayout,
};
