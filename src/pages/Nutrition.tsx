import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { PlatformTabBar, TabItem } from '@/components/ui/platform-tab-bar';
import ResponsiveContainer from '@/components/ui/responsive-container';
import TDEECalculator from '@/components/fitness/TDEECalculator';
import NutritionDashboard from '@/components/fitness/NutritionDashboard';
import { useMealPlan } from "@/hooks/useMealPlan";
import { Calculator, Utensils } from "lucide-react";

const NutritionPage = () => {
  const { user } = useAuth();
  // Active tab managed here to allow switching from child
  const [activeTab, setActiveTab] = useState('calculator');

  // Add meal plan logic
  const {
    calculationResult,
    mealPlan,
    isLoading,
    error,
    calculateTDEEAndGeneratePlan,
    updateMealPlan,
  } = useMealPlan();

  // Tabs for calculator and meal plan dashboard
  const tabs: TabItem[] = [
    {
      id: 'calculator',
      label: 'Calculator',
      icon: Calculator,
      // Pass calculateTDEEAndGeneratePlan and tab navigation setter
      content: (
        <TDEECalculator
          onCalculate={calcResult => {
            calculateTDEEAndGeneratePlan(calcResult);
            setActiveTab('dashboard');
          }}
          isLoading={isLoading}
          error={error}
        />
      ),
    },
    {
      id: 'dashboard',
      label: 'Meal Plan',
      icon: Utensils,
      content: calculationResult && mealPlan ? (
        <NutritionDashboard
          calculationResult={calculationResult}
          mealPlan={mealPlan}
          onUpdateMealPlan={updateMealPlan}
        />
      ) : (
        <div className="text-center p-8">
          Please calculate your TDEE first.
        </div>
      ),
    }
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
