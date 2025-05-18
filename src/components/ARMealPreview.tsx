
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { View, Eye } from 'lucide-react'; // Changed View3d to View
import { useARPreview } from '@/hooks/useARPreview';
import { useNavigate } from 'react-router-dom';

interface ARMealPreviewProps {
  mealId: string;
  mealName: string;
  className?: string;
}

const ARMealPreview: React.FC<ARMealPreviewProps> = ({ mealId, mealName, className = "" }) => {
  const { isSupported } = useARPreview();
  const navigate = useNavigate();
  
  const handleViewIn3D = () => {
    navigate(`/ar-view/${mealId}`);
  };
  
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex flex-col items-center justify-center space-y-4">
        <h3 className="text-lg font-semibold">View {mealName} in 3D</h3>
        
        <div className="rounded-lg bg-gray-100 dark:bg-gray-700 w-full aspect-square flex items-center justify-center">
          <Eye className="h-12 w-12 text-gray-400" />
        </div>
        
        <Button 
          onClick={handleViewIn3D} 
          className="w-full"
          disabled={!isSupported}
        >
          <View className="mr-2 h-4 w-4" />
          View in AR
        </Button>
        
        {!isSupported && (
          <p className="text-xs text-center text-red-500">
            AR is not supported on this device
          </p>
        )}
      </div>
    </Card>
  );
};

export default ARMealPreview;
