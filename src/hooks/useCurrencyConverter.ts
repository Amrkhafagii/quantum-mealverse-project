
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
  CAD: { rate: 1.35, symbol: 'CA$' },
  EGP: { rate: 50, symbol: 'EGP' } // Adding Egyptian Pound
};

// Map of country codes to currencies
const COUNTRY_TO_CURRENCY: { [key: string]: string } = {
  'US': 'USD',
  'GB': 'GBP',
  'CA': 'CAD',
  'JP': 'JPY',
  'DE': 'EUR',
  'FR': 'EUR',
  'IT': 'EUR',
  'ES': 'EUR',
  'EG': 'EGP', // Egypt
  // Add more mappings as needed
};

export const useCurrencyConverter = () => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(DEFAULT_EXCHANGE_RATES);
  const [userCurrency, setUserCurrency] = useState<string>('USD');
  const [loading, setLoading] = useState(true);

  // Detect user's country/currency
  useEffect(() => {
    const detectUserCurrency = async () => {
      try {
        // Try to detect user's country by timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        let detectedCurrency = 'USD'; // Default

        // Check if timezone contains a country code that we can map
        if (timezone.includes('Cairo') || timezone.includes('Egypt')) {
          detectedCurrency = 'EGP';
        } else {
          // Use navigator language as fallback
          const browserLang = navigator.language;
          
          // Try to extract country code from language
          const countryCode = browserLang.split('-')[1];
          if (countryCode && COUNTRY_TO_CURRENCY[countryCode]) {
            detectedCurrency = COUNTRY_TO_CURRENCY[countryCode];
          } else if (browserLang.startsWith('ar')) {
            // Arabic language might indicate Middle Eastern countries
            detectedCurrency = 'EGP';
          }
        }
        
        // Set the detected currency
        setUserCurrency(detectedCurrency);
        console.log('Detected currency:', detectedCurrency);
        
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
    } else if (currency === 'EGP') {
      return `${Math.round(price)} ${symbol}`;
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
