
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface SpecialInstructionsInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const SpecialInstructionsInput: React.FC<SpecialInstructionsInputProps> = ({
  value,
  onChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Special Instructions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="special-instructions">
            Any special requests or cooking instructions?
          </Label>
          <Textarea
            id="special-instructions"
            placeholder="e.g., 'Please cook the chicken well-done' or 'Extra sauce on the side'..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            maxLength={500}
          />
          <p className="text-xs text-gray-500">
            {value.length}/500 characters
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
