import { supabase } from '@/integrations/supabase/client';
import type {
  RestaurantEarnings,
  PaymentMethod,
  FinancialTransaction,
  Payout,
  BankAccount
} from '@/types/financial';

// Local DB row types that map exactly to the Supabase columns
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
  status: RestaurantEarnings['status'];
  earned_at: string;
  available_at?: string;
  paid_at?: string;
  payout_id?: string;
  created_at: string;
  updated_at: string;
}

// --- Functions using local types and explicit mapping ---

async function getRestaurantEarnings(
  restaurantId: string,
  options?: { limit?: number }
): Promise<RestaurantEarnings[]> {
  try {
    let query = supabase
      .from('restaurant_earnings')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (options?.limit) query = query.limit(options.limit);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching restaurant earnings:', error);
      return [];
    }
    if (!data) return [];

    // Ensure all required fields, especially commission_rate and status
    return (data as DBRestaurantEarnings[]).map(earning => ({
      ...earning,
      commission_rate: earning.commission_rate ?? 0,
      status: earning.status as RestaurantEarnings['status']
    }));
  } catch (error) {
    console.error('Error in getRestaurantEarnings:', error);
    return [];
  }
}

async function createRestaurantEarning(
  restaurantId: string,
  earningData: Omit<RestaurantEarnings, 'id' | 'created_at' | 'updated_at'>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('restaurant_earnings')
      .insert({
        restaurant_id: restaurantId,
        ...earningData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating restaurant earning:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createRestaurantEarning:', error);
    return false;
  }
}

// Dummy: Replace with real implementation!
async function getEarningsSummary(restaurantId: string): Promise<{
  totalEarnings: number;
  availableEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
}> {
  // TODO: Implement logic or fetch from Supabase
  // Returning dummy for now, so components don't break
  return {
    totalEarnings: 0,
    availableEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
  };
}

async function getTransactions(options: { restaurantId: string, limit?: number }): Promise<FinancialTransaction[]> {
  let query = supabase
    .from('financial_transactions')
    .select('*')
    .eq('restaurant_id', options.restaurantId)
    .order('created_at', { ascending: false });

  if (options?.limit) query = query.limit(options.limit);
  const { data, error } = await query;

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
  return (data ?? []) as FinancialTransaction[];
}

async function getPayouts(options: { restaurantId?: string; deliveryUserId?: string; limit?: number }): Promise<Payout[]> {
  let query = supabase
    .from('payouts')
    .select('*')
    .order('created_at', { ascending: false });

  if (options.restaurantId) query = query.eq('restaurant_id', options.restaurantId);
  if (options.deliveryUserId) query = query.eq('delivery_user_id', options.deliveryUserId);
  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching payouts:', error);
    return [];
  }
  return (data ?? []) as Payout[];
}

async function getFinancialReports(restaurantId: string, limit?: number): Promise<any[]> {
  let query = supabase
    .from('financial_reports')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });

  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching financial reports:', error);
    return [];
  }
  return data ?? [];
}

async function requestPayout(restaurantId: string): Promise<Payout | null> {
  // This should trigger payout, but for now just return null (mock)
  // You'll want to implement this via remote function/Supabase RPC or a proper insert!
  console.warn('requestPayout is not implemented in backend yet! Returning null.');
  return null;
}

async function generateFinancialReport(
  restaurantId: string,
  reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom',
  startDate: string,
  endDate: string
): Promise<any> {
  // This should trigger a report generation, for now just mock
  // You'd want Supabase edge function or RPC call for real
  return {
    reportType, startDate, endDate, generated: true
  };
}

// For bank account management
type BankAccountCreateInput = Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>;
type SetDefaultBankAccountOptions = { isDefault?: boolean };

// Smarter mapping (we do not try to map status)
async function getBankAccounts(userId: string): Promise<BankAccount[]> {
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bank accounts:', error);
    return [];
  }
  return (data ?? []) as BankAccount[];
}

async function addBankAccount(
  userId: string,
  accountData: BankAccountCreateInput
): Promise<boolean> {
  const { error } = await supabase
    .from('bank_accounts')
    .insert({
      user_id: userId,
      ...accountData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Error adding bank account:', error);
    return false;
  }
  return true;
}

async function setDefaultBankAccount(
  userId: string,
  bankAccountId: string,
  isDefault: boolean = true
): Promise<boolean> {
  // First, set all to false for user.
  const { error: clearError } = await supabase
    .from('bank_accounts')
    .update({ is_default: false })
    .eq('user_id', userId);

  if (clearError) {
    console.error('Error clearing default accounts:', clearError);
    return false;
  }

  const { error } = await supabase
    .from('bank_accounts')
    .update({ is_default: isDefault, updated_at: new Date().toISOString() })
    .eq('id', bankAccountId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error setting default bank account:', error);
    return false;
  }
  return true;
}

// Compose the service object with all needed methods
export const financialService = {
  getRestaurantEarnings,
  createRestaurantEarning,
  getBankAccounts,
  addBankAccount,
  setDefaultBankAccount,
  getEarningsSummary,
  getTransactions,
  getPayouts,
  getFinancialReports,
  requestPayout,
  generateFinancialReport,
};

export {
  getRestaurantEarnings,
  createRestaurantEarning,
  getBankAccounts,
  addBankAccount,
  setDefaultBankAccount,
  getEarningsSummary,
  getTransactions,
  getPayouts,
  getFinancialReports,
  requestPayout,
  generateFinancialReport,
};
