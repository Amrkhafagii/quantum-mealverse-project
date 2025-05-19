
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const LoadingState: React.FC = () => (
  <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
    <CardContent className="pt-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-quantum-cyan border-r-transparent border-b-quantum-cyan/40 border-l-transparent"></div>
        <p>Loading saved meal plans and hydration data...</p>
      </div>
    </CardContent>
  </Card>
);

export default LoadingState;
