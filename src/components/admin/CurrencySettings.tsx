
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ExchangeRate {
  currency: string;
  rate: number;
  symbol: string;
}

export const CurrencySettings = () => {
  const { toast } = useToast();
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([
    { currency: 'USD', rate: 1, symbol: '$' },
    { currency: 'EUR', rate: 0.92, symbol: '€' },
    { currency: 'GBP', rate: 0.78, symbol: '£' },
    { currency: 'JPY', rate: 109.25, symbol: '¥' },
    { currency: 'CAD', rate: 1.35, symbol: 'CA$' }
  ]);
  const [newCurrency, setNewCurrency] = useState<ExchangeRate>({ 
    currency: '', 
    rate: 1, 
    symbol: '' 
  });

  const handleRateChange = (index: number, value: number) => {
    const updatedRates = [...exchangeRates];
    updatedRates[index].rate = value;
    setExchangeRates(updatedRates);
  };

  const handleSaveChanges = async () => {
    try {
      // In a real app, you would save these to Supabase
      // For now, we'll just show a success message
      toast({
        title: "Success",
        description: "Currency exchange rates updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error saving exchange rates",
        description: "An error occurred while saving exchange rates",
        variant: "destructive",
      });
    }
  };

  const handleAddCurrency = () => {
    if (!newCurrency.currency || !newCurrency.symbol) {
      toast({
        title: "Error",
        description: "Please fill in all currency details",
        variant: "destructive",
      });
      return;
    }

    setExchangeRates([...exchangeRates, { ...newCurrency }]);
    setNewCurrency({ currency: '', rate: 1, symbol: '' });
  };

  const handleDeleteCurrency = (index: number) => {
    // Don't allow deleting USD (base currency)
    if (exchangeRates[index].currency === 'USD') {
      toast({
        title: "Cannot Delete Base Currency",
        description: "USD is the base currency and cannot be removed",
        variant: "destructive",
      });
      return;
    }

    const updatedRates = [...exchangeRates];
    updatedRates.splice(index, 1);
    setExchangeRates(updatedRates);
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold text-quantum-cyan mb-6">Currency Exchange Rates</h2>
      <p className="text-gray-400 mb-6">
        Set exchange rates relative to USD (Base Currency = 1.0)
      </p>

      <div className="space-y-4 mb-8">
        {exchangeRates.map((rate, index) => (
          <div key={rate.currency} className="flex items-center space-x-4">
            <div className="w-20">
              <span className="text-lg font-medium">{rate.currency}</span>
            </div>
            <div className="w-12 text-center">
              <span>{rate.symbol}</span>
            </div>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={rate.rate}
              onChange={(e) => handleRateChange(index, parseFloat(e.target.value))}
              disabled={rate.currency === 'USD'} // USD is the base currency
              className="w-32"
            />
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => handleDeleteCurrency(index)}
              disabled={rate.currency === 'USD'} // Can't delete base currency
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-700 pt-6 mb-6">
        <h3 className="text-lg font-medium mb-4">Add New Currency</h3>
        <div className="flex items-center space-x-4 mb-4">
          <Input
            placeholder="Currency Code (e.g., AUD)"
            value={newCurrency.currency}
            onChange={(e) => setNewCurrency({...newCurrency, currency: e.target.value.toUpperCase()})}
            className="w-40"
            maxLength={3}
          />
          <Input
            placeholder="Symbol (e.g., A$)"
            value={newCurrency.symbol}
            onChange={(e) => setNewCurrency({...newCurrency, symbol: e.target.value})}
            className="w-20"
            maxLength={3}
          />
          <Input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Exchange Rate"
            value={newCurrency.rate}
            onChange={(e) => setNewCurrency({...newCurrency, rate: parseFloat(e.target.value)})}
            className="w-32"
          />
          <Button onClick={handleAddCurrency}>
            Add
          </Button>
        </div>
      </div>

      <Button onClick={handleSaveChanges} className="w-full">
        Save Changes
      </Button>
    </Card>
  );
};

export default CurrencySettings;
