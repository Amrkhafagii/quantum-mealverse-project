
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export type CurrencyPreference = {
  code: string;
  symbol: string;
};

const DEFAULT_CURRENCY: CurrencyPreference = {
  code: 'USD',
  symbol: '$'
};

export const useCurrencyPreferences = () => {
  const { user } = useAuth();
  const [currencyPreference, setCurrencyPreference] = useState<CurrencyPreference>(DEFAULT_CURRENCY);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's currency preference
  useEffect(() => {
    const fetchCurrencyPreference = async () => {
      if (!user?.id) {
        setCurrencyPreference(DEFAULT_CURRENCY);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('currency')
          .eq('user_preferences_user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data?.currency) {
          const currencyCode = data.currency;
          setCurrencyPreference({
            code: currencyCode,
            symbol: getCurrencySymbol(currencyCode)
          });
        }
      } catch (error) {
        console.error('Error fetching currency preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrencyPreference();
  }, [user?.id]);

  // Update user's currency preference
  const updateCurrencyPreference = async (currencyCode: string) => {
    if (!user?.id) return false;

    try {
      const symbol = getCurrencySymbol(currencyCode);

      // Update in database; use only user_preferences_user_id, not 'user_id'
      const { error } = await supabase
        .from('user_preferences')
        .upsert(
          { user_preferences_user_id: user.id, currency: currencyCode },
          { onConflict: 'user_preferences_user_id' }
        );

      if (error) throw error;

      setCurrencyPreference({ code: currencyCode, symbol });
      return true;
    } catch (error) {
      console.error('Error updating currency preference:', error);
      return false;
    }
  };

  // Helper function to get currency symbol
  const getCurrencySymbol = (currencyCode: string): string => {
    const currencies: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CNY': '¥',
      'EGP': 'E£',
      'AED': 'د.إ',
      'SAR': '﷼'
    };

    return currencies[currencyCode] || currencyCode;
  };

  return {
    currencyPreference,
    updateCurrencyPreference,
    isLoading
  };
};
