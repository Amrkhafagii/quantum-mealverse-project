
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const EmptyState: React.FC = () => (
  <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
    <CardContent className="pt-6 text-center">
      <p>No saved meal plans found. Create and save a meal plan to see it here.</p>
    </CardContent>
  </Card>
);

export default EmptyState;
