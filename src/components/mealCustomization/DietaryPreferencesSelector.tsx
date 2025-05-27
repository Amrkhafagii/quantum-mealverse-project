
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface DietaryPreferencesSelectorProps {
  availablePreferences: string[];
  selectedPreferences: string[];
  onTogglePreference: (preference: string) => void;
}

export const DietaryPreferencesSelector: React.FC<DietaryPreferencesSelectorProps> = ({
  availablePreferences,
  selectedPreferences,
  onTogglePreference
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Dietary Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {availablePreferences.map((preference) => (
            <div key={preference} className="flex items-center space-x-2">
              <Checkbox
                id={`pref-${preference}`}
                checked={selectedPreferences.includes(preference)}
                onCheckedChange={() => onTogglePreference(preference)}
              />
              <label
                htmlFor={`pref-${preference}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {preference}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
