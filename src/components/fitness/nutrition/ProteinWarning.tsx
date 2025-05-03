
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ProteinWarningProps {
  show: boolean;
}

const ProteinWarning: React.FC<ProteinWarningProps> = ({ show }) => {
  if (!show) return null;
  
  return (
    <div className="bg-amber-900/20 border border-amber-800/30 text-amber-400 text-xs p-2 rounded flex items-center gap-1">
      <AlertCircle className="h-4 w-4" />
      <span>Your protein intake is below 95% of your target. Try reshuffling meals to increase protein.</span>
    </div>
  );
};

export default ProteinWarning;
