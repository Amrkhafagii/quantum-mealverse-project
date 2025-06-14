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
      status: earning.status as RestaurantEarnings['status'],
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

async function getTransactions(options: { restaurantId: string; limit?: number }): Promise<FinancialTransaction[]> {
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
  if (!data) return [];

  // Map each transaction to required FinancialTransaction type,
  // handling missing or renamed fields
  return (data as any[]).map(trx => ({
    ...trx,
    user_id: trx.user_id ?? trx.financial_transactions_user_id ?? '', // Add fallback from DB if named differently
    metadata: trx.metadata ?? {},
  })) as FinancialTransaction[];
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

// ---- Bank account management ----
// This function supports both (userId) and (userId, role) signatures for backward compatibility.
// If a second argument is provided, it can be 'restaurant' or 'delivery_user'.
/**
 * Get bank accounts by user (customer, restaurant, or delivery_user)
 * Usage:
 *  getBankAccounts(userId)
 *  getBankAccounts(userId, "restaurant")
 *  getBankAccounts(userId, "delivery_user")
 */
async function getBankAccounts(userId: string, role?: "restaurant" | "delivery_user"): Promise<BankAccount[]> {
  let query = supabase
    .from('bank_accounts')
    .select('*')
    .order('created_at', { ascending: false });

  // role argument must be explicitly "restaurant" or "delivery_user"
  if (role === "delivery_user") {
    query = query.eq('delivery_user_id', userId);
  } else if (role === "restaurant") {
    query = query.eq('restaurant_id', userId);
  } else {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching bank accounts:', error);
    return [];
  }
  return (data ?? []) as BankAccount[];
}

/**
 * Set default bank account for a user (customer/restaurant/delivery_user).
 * Usage:
 *  setDefaultBankAccount(userId, bankAccountId, isDefault: boolean = true)
 */
async function setDefaultBankAccount(
  userId: string,
  bankAccountId: string,
  isDefault: boolean = true
): Promise<boolean> {
  // Validate bankAccountId is string and isDefault is boolean
  // If called with only 2 args, treat as (userId, bankAccountId)
  if (typeof isDefault !== "boolean") {
    isDefault = true;
  }

  // First, set all is_default to false for this user (by user_id, for customer)
  // Try all user columns ("user_id", "restaurant_id", "delivery_user_id") for safety
  let clearQuery = supabase
    .from('bank_accounts')
    .update({ is_default: false });

  // If the id pattern is uuid and role is needed, that's handled at the callsite in component
  // Prefer clear for all possible columns since components sometimes pass role

  // Defensively try with all three keys—this works since only one is set for each account
  await clearQuery
    .or(`user_id.eq.${userId},restaurant_id.eq.${userId},delivery_user_id.eq.${userId}`);

  // Now set the specific bankAccountId to default
  const { error } = await supabase
    .from('bank_accounts')
    .update({ is_default: isDefault, updated_at: new Date().toISOString() })
    .eq('id', bankAccountId);

  if (error) {
    console.error('Error setting default bank account:', error);
    return false;
  }
  return true;
}

type BankAccountCreateInput = Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>;

async function addBankAccount(
  userId: string,
  accountData: BankAccountCreateInput
): Promise<boolean> {
  const toInsert = {
    ...accountData,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase
    .from('bank_accounts')
    .insert(toInsert);

  if (error) {
    console.error('Error adding bank account:', error);
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
