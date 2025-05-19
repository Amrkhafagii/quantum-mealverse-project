
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const LoadingState: React.FC = () => (
  <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
    <CardContent className="pt-6 text-center">
      <p>Loading saved meal plans...</p>
    </CardContent>
  </Card>
);

export default LoadingState;
