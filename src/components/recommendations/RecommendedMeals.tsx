
// Use the correct hook (MealType recommendations, not WorkoutRecommendation)!
import React from 'react';
// CRUCIAL: import like this so Vite & TS pick up the .tsx (meals, not workouts!)
import { useRecommendations } from '@/hooks/useRecommendations';
import { CustomerMealCard } from '@/components/CustomerMealCard';
import { Loader } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import type { MealType } from '@/types/meal';

interface RecommendedMealsProps {
  showTitle?: boolean;
}

const RecommendedMeals: React.FC<RecommendedMealsProps> = ({ 
  showTitle = true 
}) => {
  // This hook now gives you MealType[]
  const { recommendations, isLoading } = useRecommendations();
  const [activeTab, setActiveTab] = React.useState<'personalized' | 'trending' | 'dietary' | 'fitness'>('personalized');

  // All filtering logic expects MealType
  const getTabRecommendations = (): MealType[] => {
    switch (activeTab) {
      case 'dietary':
        return recommendations.filter((meal: MealType) =>
          Array.isArray(meal.dietary_tags) && 
          meal.dietary_tags.some(tag =>
            ['vegan', 'vegetarian', 'gluten-free', 'dairy-free'].includes(tag)
          )
        );
      case 'fitness':
        return recommendations.filter(
          (meal: MealType) => (meal.protein ?? 0) > 20 || (meal.calories ?? 0) < 500
        );
      case 'trending':
        // Shuffle for demo only
        return [...recommendations].sort(() => 0.5 - Math.random());
      case 'personalized':
      default:
        return recommendations;
    }
  };

  const tabRecs = getTabRecommendations();

  return (
    <div className="container mx-auto px-4 py-8">
      {showTitle && (
        <h2 className="text-3xl font-bold text-quantum-cyan mb-4 neon-text">
          Recommendations For You
        </h2>
      )}
      <Tabs 
        defaultValue="personalized" 
        value={activeTab}
        onValueChange={value => setActiveTab(value as any)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-8 bg-quantum-darkBlue/30">
          <TabsTrigger 
            value="personalized"
            className="data-[state=active]:bg-quantum-cyan data-[state=active]:text-quantum-black"
          >
            For You
          </TabsTrigger>
          <TabsTrigger 
            value="trending"
            className="data-[state=active]:bg-quantum-cyan data-[state=active]:text-quantum-black"
          >
            Trending
          </TabsTrigger>
          <TabsTrigger 
            value="dietary"
            className="data-[state=active]:bg-quantum-cyan data-[state=active]:text-quantum-black"
          >
            Dietary
          </TabsTrigger>
          <TabsTrigger 
            value="fitness"
            className="data-[state=active]:bg-quantum-cyan data-[state=active]:text-quantum-black"
          >
            Fitness
          </TabsTrigger>
        </TabsList>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 text-quantum-cyan animate-spin" />
            <span className="ml-2 text-quantum-cyan">Loading recommendations...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tabRecs && tabRecs.length > 0 ? tabRecs.map((meal: MealType) => (
              <CustomerMealCard key={meal.id} meal={meal} />
            )) : (
              <div className="col-span-4 text-center py-8">
                <p className="text-xl text-gray-400">
                  No recommendations available at this time.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Complete your profile or browse more meals to get personalized recommendations.
                </p>
              </div>
            )}
          </div>
        )}
      </Tabs>
    </div>
  );
};

export default RecommendedMeals;

