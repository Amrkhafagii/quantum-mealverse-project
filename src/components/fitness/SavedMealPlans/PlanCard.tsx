import React from 'react';
// FIX: Import from main .d.ts
import type { SavedMealPlan } from '@/types/fitness.d.ts';

interface PlanCardProps {
  plan: SavedMealPlan;
  onLoadPlan: (plan: SavedMealPlan) => void;
  onRenewPlan: (planId: string) => void;
  onDeletePlan: (planId: string) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  onLoadPlan,
  onRenewPlan,
  onDeletePlan,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold">{plan.name}</h3>
      <p className="text-sm text-gray-500 mb-2">
        Created: {plan.date_created ? new Date(plan.date_created).toLocaleDateString() : 'N/A'}
      </p>
      <div className="flex gap-2 mb-2">
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
          onClick={() => onLoadPlan(plan)}
        >
          Load Plan
        </button>
        <button
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
          onClick={() => onRenewPlan(plan.id!)}
        >
          Renew
        </button>
        <button
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
          onClick={() => onDeletePlan(plan.id!)}
        >
          Delete
        </button>
      </div>
      <div className="text-xs text-gray-700">{plan.is_active ? "Active" : "Inactive"}</div>
    </div>
  );
};

export default PlanCard;
