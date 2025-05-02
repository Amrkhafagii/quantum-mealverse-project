
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Currency {
  code: string;
  symbol: string;
  name: string;
  exchangeRate: number;
}

const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', exchangeRate: 1 },
  { code: 'EUR', symbol: '€', name: 'Euro', exchangeRate: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', exchangeRate: 0.78 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', exchangeRate: 109.25 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', exchangeRate: 1.35 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', exchangeRate: 1.48 },
];

export const CurrencySelector = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [loading, setLoading] = useState<boolean>(false);

  // Load user's currency preference
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('currency')
          .eq('user_id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') { // not found is okay
          throw error;
        }
        
        if (data?.currency) {
          setSelectedCurrency(data.currency);
        }
      } catch (error) {
        console.error('Error fetching currency preference:', error);
      }
    };
    
    fetchUserPreferences();
  }, [user]);

  const handleCurrencyChange = async (value: string) => {
    if (!user) return;
    
    setSelectedCurrency(value);
    setLoading(true);
    
    try {
      // Check if a user preference record exists
      const { data: existing } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (existing) {
        // Update existing record
        await supabase
          .from('user_preferences')
          .update({ currency: value })
          .eq('user_id', user.id);
      } else {
        // Insert new record
        await supabase
          .from('user_preferences')
          .insert({ user_id: user.id, currency: value });
      }
      
      toast({
        title: "Currency Updated",
        description: `Your currency has been set to ${value}`,
      });
      
      // Dispatch an event to notify other components about the currency change
      window.dispatchEvent(new CustomEvent('currency-changed', { detail: value }));
    } catch (error) {
      console.error('Error updating currency preference:', error);
      toast({
        title: "Error",
        description: "Failed to update currency preference",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Display Currency</Label>
            <Select 
              value={selectedCurrency} 
              onValueChange={handleCurrencyChange}
              disabled={loading}
            >
              <SelectTrigger id="currency" className="w-full" aria-label="Select currency">
                <SelectValue placeholder="Select a currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              This setting changes how prices are displayed. All transactions are processed in USD.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrencySelector;
