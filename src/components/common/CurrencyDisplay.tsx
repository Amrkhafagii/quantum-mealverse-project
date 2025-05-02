
import React from 'react';
import { useCurrencyPreferences } from '@/hooks/useCurrencyPreferences';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  amount, 
  className = '' 
}) => {
  const { currencyPreference } = useCurrencyPreferences();
  
  const formattedAmount = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyPreference.code,
    currencyDisplay: 'symbol',
  }).format(amount);
  
  return (
    <span className={className}>{formattedAmount}</span>
  );
};
