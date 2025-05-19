
import React from 'react';
import { Star, StarHalf } from 'lucide-react';

export interface ARMealPreviewProps {
  mealName: string;
  mealId?: string;
  className?: string;
  modelName?: string;
  rating?: number;
}

const ARMealPreview: React.FC<ARMealPreviewProps> = ({ 
  mealName, 
  mealId, 
  className = '', 
  modelName, 
  rating 
}) => {
  return (
    <div className={`ar-meal-preview ${className}`}>
      <h3 className="text-lg font-semibold">{mealName}</h3>
      <div className="ar-preview-placeholder p-4 bg-gray-800/40 rounded-lg text-center">
        <div className="text-quantum-cyan text-sm mb-2">
          {modelName ? `Model: ${modelName}` : (mealId ? `ID: ${mealId}` : 'AR Preview')}
        </div>
        <div className="w-full h-40 flex items-center justify-center border border-dashed border-gray-600 rounded">
          AR Preview Placeholder
        </div>
      </div>
    </div>
  );
};

export default ARMealPreview;
