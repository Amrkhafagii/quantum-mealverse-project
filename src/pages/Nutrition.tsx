import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { PlatformTabBar, TabItem } from '@/components/ui/platform-tab-bar';
import ResponsiveContainer from '@/components/ui/responsive-container';
// Fix import for default export (not named)
// And remove 'useMealPlan' and 'Restaurant2' icon for now since they're missing
import TDEECalculator from '@/components/fitness/TDEECalculator';
import NutritionDashboard from '@/components/fitness/NutritionDashboard';
// Remove: import { useMealPlan } from '@/hooks/useMealPlan';
// Remove: import { Calculator, Restaurant2 } from 'lucide-react';
import { Calculator } from 'lucide-react';

const NutritionPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('calculator');
  // Temporarily remove meal plan logic for build
  // const { calculationResult, mealPlan, isLoading, error, calculateTDEE, updateMealPlan } = useMealPlan(user?.id);

  const tabs: TabItem[] = [
    {
      id: 'calculator',
      label: 'Calculator',
      icon: Calculator,
      content: (
        <TDEECalculator />
      )
    },
    // Dashboard tab commented out to prevent type issues
    // {
    //   id: 'dashboard',
    //   label: 'Dashboard',
    //   icon: Restaurant2,
    //   content: (
    //     calculationResult ? (
    //       <NutritionDashboard
    //         calculationResult={calculationResult}
    //         mealPlan={mealPlan}
    //         onUpdateMealPlan={updateMealPlan}
    //       />
    //     ) : (
    //       <div className="text-center p-8">
    //         Please calculate your TDEE first.
    //       </div>
    //     )
    //   )
    // }
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
