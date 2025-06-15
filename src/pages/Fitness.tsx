
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { PlatformTabBar, TabItem } from '@/components/ui/platform-tab-bar';
import ResponsiveContainer from '@/components/ui/responsive-container';
import { ResponsiveFitnessLayout } from '@/components/fitness/ResponsiveFitnessLayout';
import { FitnessOverview } from '@/components/fitness/FitnessOverview';
import WorkoutPlanner from '@/components/fitness/WorkoutPlanner';
import WorkoutScheduler from '@/components/fitness/WorkoutScheduler';
import WorkoutHistory from '@/components/fitness/WorkoutHistory';
import WorkoutRecommendations from '@/components/fitness/WorkoutRecommendations';
import { UserAchievements } from '@/components/fitness/UserAchievements';
import { ExerciseLibrary } from '@/components/fitness/ExerciseLibrary';
import { useResponsive } from '@/contexts/ResponsiveContext';
import { 
  Activity, 
  Calendar, 
  History, 
  Target, 
  Book, 
  Trophy, 
  BarChart3 
} from 'lucide-react';

const FitnessPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const workoutData = useWorkoutData();
  const { isMobile, isTablet } = useResponsive();

  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: isMobile ? 'Stats' : 'Overview',
      icon: BarChart3,
      content: (
        <FitnessOverview 
          userId={user?.id} 
          workoutStats={workoutData.workoutStats} 
        />
      )
    },
    {
      id: 'planner',
      label: 'Plan',
      icon: Activity,
      content: <WorkoutPlanner />
    },
    {
      id: 'scheduler',
      label: 'Schedule',
      icon: Calendar,
      content: <WorkoutScheduler />
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      content: (
        <WorkoutHistory
          userId={user?.id}
          workoutHistory={workoutData.history}
          isLoading={workoutData.isLoading}
        />
      )
    },
    {
      id: 'recommendations',
      label: isMobile ? 'Tips' : 'Suggestions',
      icon: Target,
      content: (
        <WorkoutRecommendations />
      )
    },
    {
      id: 'exercise-library',
      label: 'Exercises',
      icon: Book,
      content: <ExerciseLibrary />
    },
    {
      id: 'achievements',
      label: 'Awards',
      icon: Trophy,
      content: <UserAchievements />
    }
  ];
  
  return (
    <div className="min-h-screen bg-quantum-black text-white">
      <ParticleBackground />
      <Navbar />
      
      <ResponsiveFitnessLayout>
        <div className="pt-16 sm:pt-20 md:pt-24 pb-4 sm:pb-6 md:pb-8">
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-quantum-cyan neon-text">
              Fitness Dashboard
            </h1>
          </div>
          
          <div className="w-full">
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
              className="space-y-3 sm:space-y-4"
              tabsListClassName="bg-quantum-darkBlue/50 backdrop-blur-lg border border-quantum-cyan/20 p-1 rounded-lg"
            />
          </div>
        </div>
      </ResponsiveFitnessLayout>
      
      <Footer />
    </div>
  );
};

export default FitnessPage;
