
import React from 'react';
import { useCurrencyPreferences } from '@/hooks/useCurrencyPreferences';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  isTrial?: boolean;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  amount, 
  className = '',
  isTrial = false
}) => {
  const { currencyPreference } = useCurrencyPreferences();
  
  if (isTrial) {
    return (
      <span className={className}>
        <span className="text-quantum-purple font-medium">Free Trial</span>
      </span>
    );
  }
  
  const formattedAmount = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currencyPreference.code,
    currencyDisplay: 'symbol',
  }).format(amount);
  
  return (
    <span className={className}>{formattedAmount}</span>
  );
};
