import React from 'react';
import type { SavedMealPlan } from '@/types/fitness/profile';
import PlanCard from './PlanCard';

interface PlanGridProps {
  savedPlans: SavedMealPlan[];
  onLoadPlan: (plan: SavedMealPlan) => void;
  onRenewPlan: (planId: string) => void;
  onDeletePlan: (planId: string) => void;
}

const PlanGrid: React.FC<PlanGridProps> = ({
  savedPlans,
  onLoadPlan,
  onRenewPlan,
  onDeletePlan,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {savedPlans.map(plan => (
        <PlanCard
          key={plan.id}
          plan={plan}
          onLoadPlan={onLoadPlan}
          onRenewPlan={onRenewPlan}
          onDeletePlan={onDeletePlan}
        />
      ))}
    </div>
  );
};

export default PlanGrid;
