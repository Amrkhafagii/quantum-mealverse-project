
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Package } from 'lucide-react';

export const SelectOrderPrompt: React.FC = () => {
  return (
    <Card className="h-full flex items-center justify-center">
      <CardContent className="text-center py-16">
        <Package className="h-16 w-16 mx-auto mb-4 text-quantum-cyan" />
        <h3 className="text-xl font-bold mb-2">Select an order to track</h3>
        <p className="text-gray-400">
          Click on one of your active orders to view its current status and tracking information.
        </p>
      </CardContent>
    </Card>
  );
};
