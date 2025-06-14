import { supabase } from '@/integrations/supabase/client';
import {
  PaymentMethod,
  FinancialTransaction,
  RestaurantEarnings,
  Payout,
  CommissionStructure,
  FinancialReport,
  BankAccount
} from '@/types/financial';

/**
 * Get payment methods for a user.
 */
export async function getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  try {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }

    return (data as PaymentMethod[]) || [];
  } catch (error) {
    console.error('Error in getPaymentMethods:', error);
    return [];
  }
}

/**
 * Add a new payment method for a user.
 */
export async function addPaymentMethod(
  userId: string,
  method: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at' | 'user_id'>
): Promise<boolean> {
  try {
    const { error } = await supabase.from('payment_methods').insert([
      {
        user_id: userId,
        ...method,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);

    if (error) {
      console.error('Error adding payment method:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in addPaymentMethod:', error);
    return false;
  }
}

/**
 * Update an existing payment method for a user.
 */
export async function updatePaymentMethod(
  methodId: string,
  updates: Partial<Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at' | 'user_id'>>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('payment_methods')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', methodId);

    if (error) {
      console.error('Error updating payment method:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updatePaymentMethod:', error);
    return false;
  }
}

/**
 * Delete a payment method for a user.
 */
export async function deletePaymentMethod(methodId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('payment_methods').delete().eq('id', methodId);

    if (error) {
      console.error('Error deleting payment method:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deletePaymentMethod:', error);
    return false;
  }
}

/**
 * Set a payment method as the default for a user.
 */
export async function setDefaultPaymentMethod(userId: string, methodId: string): Promise<boolean> {
  try {
    // Unset previous default
    const { error: unsetError } = await supabase
      .from('payment_methods')
      .update({ is_default: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (unsetError) {
      console.error('Error unsetting previous default payment method:', unsetError);
      return false;
    }

    // Set selected as default
    const { error: setError } = await supabase
      .from('payment_methods')
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq('id', methodId)
      .eq('user_id', userId);

    if (setError) {
      console.error('Error setting default payment method:', setError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in setDefaultPaymentMethod:', error);
    return false;
  }
}

/**
 * Get all financial transactions for a user.
 */
export async function getFinancialTransactions(userId: string): Promise<FinancialTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching financial transactions:', error);
      return [];
    }

    return (data as FinancialTransaction[]) || [];
  } catch (error) {
    console.error('Error in getFinancialTransactions:', error);
    return [];
  }
}

/**
 * Record a new financial transaction.
 */
export async function recordFinancialTransaction(
  transaction: Omit<FinancialTransaction, 'id' | 'created_at' | 'updated_at'>
): Promise<boolean> {
  try {
    const { error } = await supabase.from('financial_transactions').insert([
      {
        ...transaction,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);

    if (error) {
      console.error('Error recording financial transaction:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in recordFinancialTransaction:', error);
    return false;
  }
}

/**
 * Update the status of a financial transaction.
 */
export async function updateFinancialTransactionStatus(
  transactionId: string,
  status: FinancialTransaction['status']
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('financial_transactions')
      .update({ status: status, updated_at: new Date().toISOString() })
      .eq('id', transactionId);

    if (error) {
      console.error('Error updating financial transaction status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateFinancialTransactionStatus:', error);
    return false;
  }
}

/**
 * Get restaurant earnings.
 */
export async function getRestaurantEarnings(restaurantId: string): Promise<RestaurantEarnings[]> {
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

    return (data as RestaurantEarnings[]) || [];
  } catch (error) {
    console.error('Error in getRestaurantEarnings:', error);
    return [];
  }
}

/**
 * Record restaurant earnings.
 */
export async function recordRestaurantEarnings(
  earnings: Omit<RestaurantEarnings, 'id' | 'created_at' | 'updated_at'>
): Promise<boolean> {
  try {
    const { error } = await supabase.from('restaurant_earnings').insert([
      {
        ...earnings,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);

    if (error) {
      console.error('Error recording restaurant earnings:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in recordRestaurantEarnings:', error);
    return false;
  }
}

/**
 * Update restaurant earnings status.
 */
export async function updateRestaurantEarningsStatus(
  earningsId: string,
  status: RestaurantEarnings['status']
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('restaurant_earnings')
      .update({ status: status, updated_at: new Date().toISOString() })
      .eq('id', earningsId);

    if (error) {
      console.error('Error updating restaurant earnings status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateRestaurantEarningsStatus:', error);
    return false;
  }
}

/**
 * Get payouts.
 */
export async function getPayouts(restaurantId: string, limit?: number): Promise<Payout[]> {
  try {
    let query = supabase
      .from('payouts')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching payouts:', error);
      return [];
    }

    return (data as Payout[]) || [];
  } catch (error) {
    console.error('Error in getPayouts:', error);
    return [];
  }
}

/**
 * Record a payout.
 */
export async function recordPayout(payout: Omit<Payout, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
  try {
    const { error } = await supabase.from('payouts').insert([
      {
        ...payout,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);

    if (error) {
      console.error('Error recording payout:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in recordPayout:', error);
    return false;
  }
}

/**
 * Update payout status.
 */
export async function updatePayoutStatus(payoutId: string, status: Payout['status']): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('payouts')
      .update({ status: status, updated_at: new Date().toISOString() })
      .eq('id', payoutId);

    if (error) {
      console.error('Error updating payout status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updatePayoutStatus:', error);
    return false;
  }
}

/**
 * Get commission structures.
 */
export async function getCommissionStructures(restaurantId: string): Promise<CommissionStructure[]> {
  try {
    const { data, error } = await supabase
      .from('commission_structures')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching commission structures:', error);
      return [];
    }

    return (data as CommissionStructure[]) || [];
  } catch (error) {
    console.error('Error in getCommissionStructures:', error);
    return [];
  }
}

/**
 * Create a commission structure.
 */
export async function createCommissionStructure(
  structure: Omit<CommissionStructure, 'id' | 'created_at' | 'updated_at'>
): Promise<boolean> {
  try {
    const { error } = await supabase.from('commission_structures').insert([
      {
        ...structure,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);

    if (error) {
      console.error('Error creating commission structure:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in createCommissionStructure:', error);
    return false;
  }
}

/**
 * Update a commission structure.
 */
export async function updateCommissionStructure(
  structureId: string,
  updates: Partial<Omit<CommissionStructure, 'id' | 'created_at' | 'updated_at'>>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('commission_structures')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', structureId);

    if (error) {
      console.error('Error updating commission structure:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateCommissionStructure:', error);
    return false;
  }
}

/**
 * Delete a commission structure.
 */
export async function deleteCommissionStructure(structureId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('commission_structures').delete().eq('id', structureId);

    if (error) {
      console.error('Error deleting commission structure:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteCommissionStructure:', error);
    return false;
  }
}

/**
 * Generate a financial report.
 */
export async function generateFinancialReport(
  restaurantId: string,
  reportType: FinancialReport['report_type'],
  startDate: string,
  endDate: string
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('generate_financial_report', {
      p_restaurant_id: restaurantId,
      p_report_type: reportType,
      p_period_start: startDate,
      p_period_end: endDate
    });

    if (error) {
      console.error('Error generating financial report:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in generateFinancialReport:', error);
    return false;
  }
}

/**
 * Get financial reports.
 */
export async function getFinancialReports(restaurantId: string): Promise<FinancialReport[]> {
  try {
    const { data, error } = await supabase
      .from('financial_reports')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('period_start', { ascending: false });

    if (error) {
      console.error('Error fetching financial reports:', error);
      return [];
    }

    return (data as FinancialReport[]) || [];
  } catch (error) {
    console.error('Error in getFinancialReports:', error);
    return [];
  }
}

/**
 * Get restaurant earnings summary.
 */
export async function getRestaurantEarningsSummary(restaurantId: string): Promise<{
  total_earnings: number;
  available_earnings: number;
  pending_earnings: number;
  paid_earnings: number;
} | null> {
  try {
    const { data, error } = await supabase.rpc('get_restaurant_earnings_summary', {
      p_restaurant_id: restaurantId
    });

    if (error) {
      console.error('Error fetching restaurant earnings summary:', error);
      return null;
    }

    if (!data) return null;

    return {
      total_earnings: data.total_earnings || 0,
      available_earnings: data.available_earnings || 0,
      pending_earnings: data.pending_earnings || 0,
      paid_earnings: data.paid_earnings || 0
    };
  } catch (error) {
    console.error('Error in getRestaurantEarningsSummary:', error);
    return null;
  }
}

/**
 * Request restaurant payout.
 */
export async function requestRestaurantPayout(restaurantId: string, amount: number): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('request_restaurant_payout', {
      p_restaurant_id: restaurantId,
      p_amount: amount
    });

    if (error) {
      console.error('Error requesting restaurant payout:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in requestRestaurantPayout:', error);
    return false;
  }
}

/**
 * Get bank accounts for a user (restaurant or delivery, depending on use-case)
 */
export async function getBankAccounts(userId: string): Promise<BankAccount[]> {
  try {
    // By your model, userId may mean restaurant_id OR delivery_user_id depending on context.
    // We'll assume restaurant_id; adjust if needed.
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('restaurant_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching bank accounts:", error);
      return [];
    }
    if (!data) return [];
    return data as BankAccount[];
  } catch (err) {
    console.error("Error in getBankAccounts:", err);
    return [];
  }
}

/**
 * Add a new bank account for a user (restaurant or delivery, depending on use-case)
 */
export async function addBankAccount(
  userId: string,
  account: Omit<BankAccount, "id" | "created_at" | "updated_at" | "restaurant_id" | "delivery_user_id">
): Promise<boolean> {
  try {
    // We'll assume restaurant user by default
    const { error } = await supabase
      .from('bank_accounts')
      .insert([{
        ...account,
        restaurant_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]);
    if (error) {
      console.error("Error adding bank account:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error in addBankAccount:", err);
    return false;
  }
}

/**
 * Set a bank account as the default for a user.
 */
export async function setDefaultBankAccount(
  userId: string,
  bankAccountId: string
): Promise<boolean> {
  try {
    // Unset previous default for this restaurant
    const { error: unsetError } = await supabase
      .from('bank_accounts')
      .update({ is_default: false, updated_at: new Date().toISOString() })
      .eq('restaurant_id', userId);

    if (unsetError) {
      console.error("Error unsetting previous default bank account:", unsetError);
      // Continue anyway
    }

    // Set selected account as default
    const { error: setError } = await supabase
      .from('bank_accounts')
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq('id', bankAccountId)
      .eq('restaurant_id', userId);

    if (setError) {
      console.error("Error setting default bank account:", setError);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error in setDefaultBankAccount:", err);
    return false;
  }
}
