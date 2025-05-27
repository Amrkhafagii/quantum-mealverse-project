
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

interface PortionSizeSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const PortionSizeSelector: React.FC<PortionSizeSelectorProps> = ({
  value,
  onChange,
  min = 0.5,
  max = 2.0,
  step = 0.1
}) => {
  const handleValueChange = (values: number[]) => {
    onChange(values[0]);
  };

  const getPortionLabel = (multiplier: number) => {
    if (multiplier < 0.8) return 'Small';
    if (multiplier < 1.2) return 'Regular';
    if (multiplier < 1.5) return 'Large';
    return 'Extra Large';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Portion Size</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{getPortionLabel(value)}</span>
            <span className="text-sm text-gray-600">{(value * 100).toFixed(0)}%</span>
          </div>
          
          <Slider
            value={[value]}
            onValueChange={handleValueChange}
            min={min}
            max={max}
            step={step}
            className="w-full"
          />
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>Small ({(min * 100).toFixed(0)}%)</span>
            <span>Regular (100%)</span>
            <span>XL ({(max * 100).toFixed(0)}%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
