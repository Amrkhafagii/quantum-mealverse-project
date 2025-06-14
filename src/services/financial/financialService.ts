
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
  restaurantId: string
): Promise<RestaurantEarnings[]> {
  try {
    const { data, error } = await supabase
      .from('restaurant_earnings')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching restaurant earnings:', error);
      return [];
    }

    if (!data) return [];

    // Ensure all required fields, especially commission_rate
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

// For bank account management
// BankAccountCreateInput does not exist, so we'll just take all BankAccount fields except id, created_at, updated_at
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

  // Sanitize return: don't spread status field, which doesn't exist, just type cast.
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

// Add all existing exports/functions here as methods in this object
export const financialService = {
  getRestaurantEarnings,
  createRestaurantEarning,
  getBankAccounts,
  addBankAccount,
  setDefaultBankAccount,
  // You should add all other previously exported functions as well!
  // e.g. getPaymentMethods, addPaymentMethod, getTransactions, getPayouts, getFinancialReports, requestPayout, generateFinancialReport, getEarningsSummary, etc.
};

// If you need to preserve existing named exports (for legacy code), you can also add:
export {
  getRestaurantEarnings,
  createRestaurantEarning,
  getBankAccounts,
  addBankAccount,
  setDefaultBankAccount,
};

