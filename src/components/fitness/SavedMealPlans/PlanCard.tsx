import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Droplets, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { SavedMealPlan } from '@/types/fitness/nutrition';
import { MealPlan } from '@/types/food';
import { getDaysRemaining } from '@/services/mealPlan';

interface PlanCardProps {
  plan: SavedMealPlan;
  onLoadPlan: (plan: SavedMealPlan) => void;
  onRenewPlan: (planId: string) => void;
  onDeletePlan: (planId: string) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onLoadPlan, onRenewPlan, onDeletePlan }) => {
  // Cast meal_plan to MealPlan to ensure TypeScript recognizes it, with fallback
  const mealPlan = (plan.meal_plan || plan.meals) as unknown as MealPlan;
  
  const getStatusBadge = (plan: SavedMealPlan) => {
    if (!plan.expires_at) return null;
    
    const daysRemaining = getDaysRemaining(plan.expires_at);
    
    if (!plan.is_active || daysRemaining <= 0) {
      return <Badge variant="destructive" className="flex gap-1 items-center"><AlertCircle className="h-3.5 w-3.5" /> Expired</Badge>;
    }
    
    if (daysRemaining <= 3) {
      return <Badge variant="outline" className="flex gap-1 items-center bg-amber-500 border-amber-500 text-white"><Clock className="h-3.5 w-3.5" /> Expires soon</Badge>;
    }
    
    return <Badge variant="outline" className="flex gap-1 items-center bg-green-600 border-green-600 text-white"><Clock className="h-3.5 w-3.5" /> Active</Badge>;
  };

  // Safely access plan properties with fallbacks
  const planIsActive = plan.is_active !== undefined ? plan.is_active : true;
  const expiresAt = plan.expires_at;
  const dateCreated = plan.date_created || plan.created_at || new Date().toISOString();
  const daysRemaining = expiresAt ? getDaysRemaining(expiresAt) : null;
  const isExpired = !planIsActive || (daysRemaining !== null && daysRemaining <= 0);

  return (
    <Card className={`holographic-card overflow-hidden ${isExpired ? 'opacity-70' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex justify-between items-center">
            <span>{plan.name}</span>
          </CardTitle>
          {expiresAt && getStatusBadge(plan)}
        </div>
        <CardDescription className="flex flex-col gap-1">
          <span>Created {new Date(dateCreated).toLocaleDateString()}</span>
          {expiresAt && (
            <span className="flex items-center gap-1">
              {daysRemaining !== null && daysRemaining <= 0
                ? "Expired" 
                : `Expires in ${daysRemaining || 0} days`}
            </span>
          )}
        </CardDescription>
        <div className="text-quantum-purple text-xl font-medium mt-1">
          {mealPlan?.totalCalories || 0} kcal
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-blue-900/30 p-2 rounded">
              <div className="text-xs">Protein</div>
              <div className="font-semibold">{mealPlan?.targetProtein || 0}g</div>
            </div>
            <div className="bg-green-900/30 p-2 rounded">
              <div className="text-xs">Carbs</div>
              <div className="font-semibold">{mealPlan?.targetCarbs || 0}g</div>
            </div>
            <div className="bg-yellow-900/30 p-2 rounded">
              <div className="text-xs">Fats</div>
              <div className="font-semibold">{mealPlan?.targetFat || 0}g</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-blue-900/20 rounded">
            <Droplets className="h-5 w-5 text-blue-400" />
            <div className="text-sm">
              Water: {mealPlan?.hydrationTarget || 0} ml
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button 
          onClick={() => onLoadPlan(plan)}
          className="w-full bg-quantum-cyan hover:bg-quantum-cyan/90"
          disabled={isExpired}
        >
          Load Plan
        </Button>
        <div className="flex gap-2 w-full">
          {expiresAt && (
            <Button 
              onClick={() => onRenewPlan(plan.id)}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Renew
            </Button>
          )}
          <Button 
            onClick={() => onDeletePlan(plan.id)}
            variant="destructive"
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PlanCard;
