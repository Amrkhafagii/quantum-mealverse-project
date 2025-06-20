
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Define a simple Currency type
interface Currency {
  code: string;
  symbol: string;
  exchangeRate: number;
}

// Currency list
const currencies: Record<string, Currency> = {
  USD: { code: 'USD', symbol: '$', exchangeRate: 1 },
  EUR: { code: 'EUR', symbol: '€', exchangeRate: 0.92 },
  GBP: { code: 'GBP', symbol: '£', exchangeRate: 0.78 },
  JPY: { code: 'JPY', symbol: '¥', exchangeRate: 109.25 },
  CAD: { code: 'CAD', symbol: 'CA$', exchangeRate: 1.35 },
  AUD: { code: 'AUD', symbol: 'A$', exchangeRate: 1.48 },
};

type CurrencyContextType = {
  currentCurrency: Currency;
  formatPrice: (priceInUSD: number) => string;
  convertPrice: (priceInUSD: number) => number;
};

// Default currency
const defaultCurrency: Currency = { code: 'USD', symbol: '$', exchangeRate: 1 };

// Set explicit type parameter and default value for context
const CurrencyContext = createContext<CurrencyContextType | null>(null);

// Provider implementation
export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentCurrency, setCurrentCurrency] = useState<Currency>(defaultCurrency);

  useEffect(() => {
    const fetchUserCurrency = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('user_preferences')
          .select('currency')
          .eq('user_preferences_user_id', user.id)
          .single();

        if (data?.currency && currencies[data.currency]) {
          setCurrentCurrency(currencies[data.currency]);
        }
      } catch (error) {
        console.error('Error fetching user currency:', error);
      }
    };

    fetchUserCurrency();

    // Listen for "currency-changed" event
    const handleCurrencyChange = (event: Event) => {
      const currencyCode = (event as CustomEvent).detail;
      if (currencies[currencyCode]) {
        setCurrentCurrency(currencies[currencyCode]);
      }
    };

    window.addEventListener('currency-changed', handleCurrencyChange);

    return () => {
      window.removeEventListener('currency-changed', handleCurrencyChange);
    };
  }, [user]);

  const formatPrice = (priceInUSD: number): string => {
    const convertedPrice = priceInUSD * currentCurrency.exchangeRate;
    if (currentCurrency.code === 'JPY') {
      return `${currentCurrency.symbol}${Math.round(convertedPrice)}`;
    }
    return `${currentCurrency.symbol}${convertedPrice.toFixed(2)}`;
  };

  const convertPrice = (priceInUSD: number): number => priceInUSD * currentCurrency.exchangeRate;

  const value: CurrencyContextType = {
    currentCurrency,
    formatPrice,
    convertPrice,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Custom hook to consume context
export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
