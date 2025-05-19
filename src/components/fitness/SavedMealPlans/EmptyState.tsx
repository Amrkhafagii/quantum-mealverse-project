
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { GlassWater } from 'lucide-react';

const EmptyState: React.FC = () => (
  <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
    <CardContent className="pt-6 text-center space-y-4">
      <div className="w-16 h-16 mx-auto rounded-full bg-quantum-darkBlue/50 flex items-center justify-center">
        <GlassWater className="h-8 w-8 text-quantum-cyan/70" />
      </div>
      <div>
        <h3 className="text-lg font-medium text-quantum-cyan mb-1">No saved meal plans</h3>
        <p className="text-sm text-gray-400">Create and save a meal plan to see it here. Your saved plans will include dietary recommendations and hydration targets.</p>
      </div>
    </CardContent>
  </Card>
);

export default EmptyState;
