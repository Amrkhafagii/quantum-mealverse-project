
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Currency {
  code: string;
  symbol: string;
  exchangeRate: number;
}

const currencies: Record<string, Currency> = {
  USD: { code: 'USD', symbol: '$', exchangeRate: 1 },
  EUR: { code: 'EUR', symbol: '€', exchangeRate: 0.92 },
  GBP: { code: 'GBP', symbol: '£', exchangeRate: 0.78 },
  JPY: { code: 'JPY', symbol: '¥', exchangeRate: 109.25 },
  CAD: { code: 'CAD', symbol: 'CA$', exchangeRate: 1.35 },
  AUD: { code: 'AUD', symbol: 'A$', exchangeRate: 1.48 },
};

interface CurrencyContextType {
  currentCurrency: Currency;
  formatPrice: (priceInUSD: number) => string;
  convertPrice: (priceInUSD: number) => number;
}

const defaultCurrency: Currency = { code: 'USD', symbol: '$', exchangeRate: 1 };

// Standalone default functions for context to break circular typing
function formatUSD(price: number) {
  return `$${price.toFixed(2)}`;
}
function passthrough(price: number) {
  return price;
}

// Context is initialized as undefined and asserted in hook
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

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
          .eq('user_id', user.id)
          .single();

        if (data?.currency && currencies[data.currency]) {
          setCurrentCurrency(currencies[data.currency]);
        }
      } catch (error) {
        console.error('Error fetching user currency:', error);
      }
    };

    fetchUserCurrency();

    const handleCurrencyChange = (event: CustomEvent) => {
      const currencyCode = event.detail;
      if (currencies[currencyCode]) {
        setCurrentCurrency(currencies[currencyCode]);
      }
    };

    window.addEventListener('currency-changed', handleCurrencyChange as EventListener);

    return () => {
      window.removeEventListener('currency-changed', handleCurrencyChange as EventListener);
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

  return (
    <CurrencyContext.Provider value={{ currentCurrency, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    // You can customize this error for dev/production, or fallback to default
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
