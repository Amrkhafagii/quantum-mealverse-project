
import React from 'react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { CustomerMealCard } from '@/components/CustomerMealCard';
import { Loader } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

interface RecommendedMealsProps {
  showTitle?: boolean;
}

const RecommendedMeals: React.FC<RecommendedMealsProps> = ({ 
  showTitle = true 
}) => {
  const [activeTab, setActiveTab] = React.useState<'personalized' | 'trending' | 'dietary' | 'fitness'>('personalized');
  const { recommendations, isLoading } = useRecommendations(activeTab);

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
        onValueChange={(value) => setActiveTab(value as any)}
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
            {recommendations?.map(meal => (
              <CustomerMealCard key={meal.id} meal={meal} />
            ))}
            
            {recommendations?.length === 0 && (
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
