
import React, { useState } from 'react';
import { useCurrencyPreferences } from '@/hooks/useCurrencyPreferences';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface UserCurrencySelectorProps {
  onClose?: () => void;
}

const AVAILABLE_CURRENCIES = [
  { code: 'USD', name: 'US Dollar ($)' },
  { code: 'EUR', name: 'Euro (€)' },
  { code: 'GBP', name: 'British Pound (£)' },
  { code: 'EGP', name: 'Egyptian Pound (E£)' },
  { code: 'AED', name: 'UAE Dirham (د.إ)' },
  { code: 'SAR', name: 'Saudi Riyal (﷼)' },
];

export const UserCurrencySelector: React.FC<UserCurrencySelectorProps> = ({ onClose }) => {
  const { currencyPreference, updateCurrencyPreference, isLoading } = useCurrencyPreferences();
  const [selectedCurrency, setSelectedCurrency] = useState<string>(currencyPreference.code);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveCurrency = async () => {
    if (selectedCurrency === currencyPreference.code) {
      onClose?.();
      return;
    }

    setIsSaving(true);
    const success = await updateCurrencyPreference(selectedCurrency);
    
    if (success) {
      toast({
        title: "Currency updated",
        description: `Your preferred currency has been set to ${selectedCurrency}`,
      });
      onClose?.();
    } else {
      toast({
        title: "Failed to update currency",
        description: "Please try again later",
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-1">
      <div className="space-y-2">
        <label className="text-sm font-medium">Select your preferred currency</label>
        <Select
          value={selectedCurrency}
          onValueChange={setSelectedCurrency}
          disabled={isSaving}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {AVAILABLE_CURRENCIES.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end gap-2">
        {onClose && (
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSaveCurrency} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Save
        </Button>
      </div>
    </div>
  );
};
