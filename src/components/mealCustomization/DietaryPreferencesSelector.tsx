
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

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
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {availablePreferences.map((preference) => (
            <div key={preference} className="flex items-center space-x-2">
              <Checkbox
                id={`diet-${preference}`}
                checked={selectedPreferences.includes(preference)}
                onCheckedChange={() => onTogglePreference(preference)}
              />
              <Label
                htmlFor={`diet-${preference}`}
                className="text-sm font-medium cursor-pointer"
              >
                {preference}
              </Label>
            </div>
          ))}
        </div>
        
        {selectedPreferences.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800">Selected preferences:</p>
            <p className="text-sm text-blue-600">{selectedPreferences.join(', ')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
