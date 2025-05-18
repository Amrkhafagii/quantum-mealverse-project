
import React from 'react';
import { useParams } from 'react-router-dom';
import ARMealPreview from '@/components/ARMealPreview'; // Fixed import path

const MealDetailsPage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container mx-auto p-4 pt-20">
      <h1 className="text-2xl font-bold text-quantum-cyan mb-6">Meal Details</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="mb-4">Meal ID: {id}</p>
          {/* Meal details would be fetched and displayed here */}
          <p className="text-gray-400">Additional meal details would appear here.</p>
        </div>
        
        <ARMealPreview 
          mealId={id || '1'} 
          mealName="Quantum Meal" 
          className="w-full"
        />
      </div>
    </div>
  );
};

export default MealDetailsPage;
