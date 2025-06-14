import { supabase } from '@/integrations/supabase/client';
import { RestaurantEarnings } from '@/types/financial';

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
  earned_at: string;
  available_at?: string;
  paid_at?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// --- Functions using local types and explicit mapping ---

export const getRestaurantEarnings = async (
  restaurantId: string
): Promise<RestaurantEarnings[]> => {
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

    // Cast and map to RestaurantEarnings[]
    return (data as DBRestaurantEarnings[]).map(earning => ({
      ...earning,
      status: earning.status as RestaurantEarnings['status'] // Explicitly cast the status
    }));
  } catch (error) {
    console.error('Error in getRestaurantEarnings:', error);
    return [];
  }
};

export const createRestaurantEarning = async (
  restaurantId: string,
  earningData: Omit<RestaurantEarnings, 'id' | 'created_at' | 'updated_at'>
): Promise<boolean> => {
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
};

// For bank account management
import type { BankAccount, BankAccountCreateInput } from '@/types/financial';

export const getBankAccounts = async (userId: string): Promise<BankAccount[]> => {
  // Only 1 argument (userId)
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bank accounts:', error);
    return [];
  }

  // Map status to allowed union
  return (data ?? []).map((acc) => ({
    ...acc,
    status: ['pending', 'available', 'paid', 'on_hold'].includes(acc.status)
      ? acc.status
      : 'pending', // fallback to 'pending' if bad value
  })) as BankAccount[];
};

export const addBankAccount = async (
  userId: string,
  accountData: BankAccountCreateInput
): Promise<boolean> => {
  // 2 arguments (userId, accountData)
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
};

export const setDefaultBankAccount = async (
  userId: string,
  bankAccountId: string,
  isDefault: boolean = true
): Promise<boolean> => {
  // 3 arguments (userId, bankAccountId, isDefault); isDefault default true.
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
};
