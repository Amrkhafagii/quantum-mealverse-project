
import { useState, useEffect } from 'react';

// Interface for exchange rates
interface ExchangeRates {
  [currency: string]: {
    rate: number;
    symbol: string;
  };
}

// Default exchange rates
const DEFAULT_EXCHANGE_RATES: ExchangeRates = {
  USD: { rate: 1, symbol: '$' },
  EUR: { rate: 0.92, symbol: '€' },
  GBP: { rate: 0.78, symbol: '£' },
  JPY: { rate: 109.25, symbol: '¥' },
  CAD: { rate: 1.35, symbol: 'CA$' }
};

export const useCurrencyConverter = () => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(DEFAULT_EXCHANGE_RATES);
  const [userCurrency, setUserCurrency] = useState<string>('USD');
  const [loading, setLoading] = useState(true);

  // Detect user's country/currency
  useEffect(() => {
    const detectUserCurrency = async () => {
      try {
        // In a real app, you would use an API to get the user's location
        // For this example, we'll try to use the browser's language to guess
        const browserLang = navigator.language;
        
        // Very simple mapping based on language
        const currencyMap: { [key: string]: string } = {
          'en-US': 'USD',
          'en-GB': 'GBP',
          'en-CA': 'CAD',
          'ja': 'JPY',
          'ja-JP': 'JPY',
          'de': 'EUR',
          'fr': 'EUR',
          'it': 'EUR',
          'es': 'EUR'
        };
        
        // Default to USD if we can't determine
        const detectedCurrency = currencyMap[browserLang] || 'USD';
        setUserCurrency(detectedCurrency);
        
        // Fetch stored exchange rates (in real app, from supabase)
        // Here we just use the defaults
        
      } catch (error) {
        console.error('Error detecting currency:', error);
        // Default to USD on error
        setUserCurrency('USD');
      } finally {
        setLoading(false);
      }
    };
    
    detectUserCurrency();
  }, []);

  // Convert price from USD to user's currency
  const convertPrice = (priceInUSD: number, targetCurrency?: string) => {
    const currency = targetCurrency || userCurrency;
    const rate = exchangeRates[currency]?.rate || 1;
    return priceInUSD * rate;
  };

  // Format price with currency symbol
  const formatPrice = (price: number, targetCurrency?: string) => {
    const currency = targetCurrency || userCurrency;
    const symbol = exchangeRates[currency]?.symbol || '$';
    
    // Handle special formatting for some currencies
    if (currency === 'JPY') {
      return `${symbol}${Math.round(price)}`;
    }
    
    return `${symbol}${price.toFixed(2)}`;
  };

  // Combined function to convert and format
  const displayPrice = (priceInUSD: number, targetCurrency?: string) => {
    const convertedPrice = convertPrice(priceInUSD, targetCurrency);
    return formatPrice(convertedPrice, targetCurrency);
  };

  return {
    userCurrency,
    exchangeRates,
    loading,
    convertPrice,
    formatPrice,
    displayPrice
  };
};
