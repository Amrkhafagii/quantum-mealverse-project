import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CurrencySelectorProps {
  defaultCurrency?: string;
  onCurrencyChange?: (currency: string) => void;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  defaultCurrency = 'USD',
  onCurrencyChange,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currency, setCurrency] = useState(defaultCurrency);
  const [locationTracking, setLocationTracking] = useState(false);
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [proteinTarget, setProteinTarget] = useState(150);
  const [fatTarget, setFatTarget] = useState(60);
  const [carbsTarget, setCarbsTarget] = useState(200);
	const [allergies, setAllergies] = useState<string[]>([]);
	const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  useEffect(() => {
    if (currency !== defaultCurrency && onCurrencyChange) {
      onCurrencyChange(currency);
    }
  }, [currency, onCurrencyChange, defaultCurrency]);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_preferences_user_id', user?.id)
        .single();

      if (error) {
        console.error('Error loading user preferences:', error);
        return;
      }

      if (data) {
        setCurrency(data.currency || 'USD');
        setLocationTracking(data.location_tracking_enabled || false);
        setCalorieTarget(data.calorie_target || 2000);
        setProteinTarget(data.protein_target || 150);
        setFatTarget(data.fat_target || 60);
        setCarbsTarget(data.carbs_target || 200);
				setAllergies(data.allergies || []);
				setDietaryRestrictions(data.dietary_restrictions || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async () => {
    if (!user) {
      toast({
        title: 'Not authenticated',
        description: 'You must be logged in to update preferences.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(
          {
            currency: currency,
            location_tracking_enabled: locationTracking,
            calorie_target: calorieTarget,
            protein_target: proteinTarget,
            fat_target: fatTarget,
            carbs_target: carbsTarget,
						allergies: allergies,
						dietary_restrictions: dietaryRestrictions,
            user_preferences_user_id: user.id, // instead of user_id
          },
          { onConflict: 'user_id' }
        )
        .select();

      if (error) {
        console.error('Error updating user preferences:', error);
        toast({
          title: 'Error',
          description: 'Failed to update preferences. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Preferences Updated!',
        description: 'Your preferences have been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update preferences. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="space-y-1">
          <Label htmlFor="currency">Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger id="currency">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              {/* Add more currencies as needed */}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="location-tracking">Enable Location Tracking</Label>
          <Switch
            id="location-tracking"
            checked={locationTracking}
            onCheckedChange={(checked) => setLocationTracking(checked)}
          />
        </div>
        <div className="space-y-2">
          <Label>Calorie Target: {calorieTarget}</Label>
          <Slider
            defaultValue={[calorieTarget]}
            max={3000}
            step={100}
            onValueChange={(value) => setCalorieTarget(value[0])}
          />
        </div>
        <div className="space-y-2">
          <Label>Protein Target: {proteinTarget}g</Label>
          <Slider
            defaultValue={[proteinTarget]}
            max={300}
            step={10}
            onValueChange={(value) => setProteinTarget(value[0])}
          />
        </div>
        <div className="space-y-2">
          <Label>Fat Target: {fatTarget}g</Label>
          <Slider
            defaultValue={[fatTarget]}
            max={150}
            step={5}
            onValueChange={(value) => setFatTarget(value[0])}
          />
        </div>
        <div className="space-y-2">
          <Label>Carbs Target: {carbsTarget}g</Label>
          <Slider
            defaultValue={[carbsTarget]}
            max={400}
            step={10}
            onValueChange={(value) => setCarbsTarget(value[0])}
          />
        </div>
        <button
          onClick={updatePreferences}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Preferences'}
        </button>
      </CardContent>
    </Card>
  );
};
