
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { PlatformTabBar, TabItem } from '@/components/ui/platform-tab-bar';
import ResponsiveContainer from '@/components/ui/responsive-container';
import TDEECalculator from '@/components/fitness/TDEECalculator';
import NutritionDashboard from '@/components/fitness/NutritionDashboard';
import { Calculator, Utensils } from 'lucide-react';
import { generateMealPlan } from '@/services/mealPlan/mealGenerationService';
import { MealPlan } from '@/types/food';
import { TDEEResult } from '@/services/mealPlan/types';

const NutritionPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('calculator');
  const [tdeeResult, setTdeeResult] = useState<TDEEResult | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);

  // Save calculation result to pass to Meal Plan + generate plan
  const handleTdeeCalculated = (result: TDEEResult) => {
    setTdeeResult(result); // Store for potential further use
    // Generate a meal plan using the result
    const plan = generateMealPlan(result);
    setMealPlan(plan);
    setActiveTab('dashboard');
  };

  const handleUpdateMealPlan = (updatedPlan: MealPlan) => {
    setMealPlan(updatedPlan);
  };

  const tabs: TabItem[] = [
    {
      id: 'calculator',
      label: 'Calculator',
      icon: Calculator,
      content: (
        <TDEECalculator
          onGenerateMealPlan={handleTdeeCalculated}
        />
      ),
    },
    {
      id: 'dashboard',
      label: 'Meal Plan',
      icon: Utensils,
      content: tdeeResult && mealPlan ? (
        <NutritionDashboard
          calculationResult={tdeeResult}
          mealPlan={mealPlan}
          onUpdateMealPlan={handleUpdateMealPlan}
        />
      ) : (
        <div className="text-center p-8">
          Please calculate your TDEE and click "Generate Meal Plan".
        </div>
      ),
    },
  ];
  
  return (
    <div className="min-h-screen bg-quantum-black text-white">
      <ParticleBackground />
      <Navbar />
      <ResponsiveContainer 
        className="pt-20 sm:pt-24 pb-4 sm:pb-8 lg:pb-12"
        maxWidth="2xl"
        respectSafeArea={true}
        padded={true}
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-quantum-cyan mb-4 sm:mb-6 neon-text">
          Nutrition Planner
        </h1>
        <div className="mt-4 sm:mt-6">
          <PlatformTabBar
            tabs={tabs}
            value={activeTab}
            onChange={setActiveTab}
            variant="default"
            position="top"
            fullWidth={true}
            showIcons={true}
            showLabels={true}
            animated={true}
            className="space-y-2 sm:space-y-4"
            tabsListClassName="bg-quantum-darkBlue/50 backdrop-blur-lg border border-quantum-cyan/20"
          />
        </div>
      </ResponsiveContainer>
      <Footer />
    </div>
  );
};

export default NutritionPage;
