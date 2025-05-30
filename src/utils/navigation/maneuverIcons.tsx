
import React from 'react';
import { RotateCcw, RotateCw, ArrowUp } from 'lucide-react';

export const getManeuverIcon = (maneuver: string) => {
  switch (maneuver) {
    case 'turn-left':
      return <RotateCcw className="h-6 w-6 text-quantum-cyan" />;
    case 'turn-right':
      return <RotateCw className="h-6 w-6 text-quantum-cyan" />;
    default:
      return <ArrowUp className="h-6 w-6 text-quantum-cyan" />;
  }
};
