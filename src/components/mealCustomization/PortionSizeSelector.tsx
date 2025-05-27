
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PortionSizeSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const portionOptions = [
  { value: 0.75, label: 'Small', description: '25% less' },
  { value: 1.0, label: 'Regular', description: 'Standard portion' },
  { value: 1.25, label: 'Large', description: '25% more' },
  { value: 1.5, label: 'Extra Large', description: '50% more' }
];

export const PortionSizeSelector: React.FC<PortionSizeSelectorProps> = ({
  value,
  onChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Portion Size</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={value.toString()}
          onValueChange={(val) => onChange(parseFloat(val))}
          className="space-y-3"
        >
          {portionOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value.toString()} id={`portion-${option.value}`} />
              <Label htmlFor={`portion-${option.value}`} className="flex-1 cursor-pointer">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-sm text-gray-600">{option.description}</span>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
