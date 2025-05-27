
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChange,
  max = 10,
  min = 1
}) => {
  const increment = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quantity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={decrement}
            disabled={value <= min}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-4 w-4" />
          </Button>
          
          <span className="text-2xl font-semibold min-w-[3rem] text-center">
            {value}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={increment}
            disabled={value >= max}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-sm text-gray-600 text-center mt-2">
          Servings (max {max})
        </p>
      </CardContent>
    </Card>
  );
};
