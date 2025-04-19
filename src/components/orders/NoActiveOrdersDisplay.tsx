
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package } from 'lucide-react';

export const NoActiveOrdersDisplay: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="h-full flex items-center justify-center">
      <CardContent className="text-center py-16">
        <Package className="h-16 w-16 mx-auto mb-4 text-quantum-cyan" />
        <h3 className="text-xl font-bold mb-2">No Active Orders to Track</h3>
        <p className="text-gray-400 mb-4">
          When you place an order, you'll be able to track it here in real-time.
        </p>
        <Button onClick={() => navigate('/customer')}>
          Browse Meals
        </Button>
      </CardContent>
    </Card>
  );
};
