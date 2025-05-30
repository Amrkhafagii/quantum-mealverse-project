
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { PlatformTabBar, TabItem } from '@/components/ui/platform-tab-bar';
import ResponsiveContainer from '@/components/ui/responsive-container';
import { FitnessOverview } from '@/components/fitness/FitnessOverview';
import WorkoutPlanner from '@/components/fitness/WorkoutPlanner';
import WorkoutScheduler from '@/components/fitness/WorkoutScheduler';
import WorkoutHistory from '@/components/fitness/WorkoutHistory';
import WorkoutRecommendations from '@/components/fitness/WorkoutRecommendations';
import UserAchievements from '@/components/fitness/UserAchievements';
import ExerciseLibrary from '@/components/fitness/ExerciseLibrary';
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

  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: 'Overview',
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
      label: 'Planner',
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
      label: 'Suggestions',
      icon: Target,
      content: (
        <WorkoutRecommendations
          userId={user?.id}
          onApplied={workoutData.fetchWorkoutPlans}
        />
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
      content: <UserAchievements userId={user?.id} />
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
          Fitness Dashboard
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

export default FitnessPage;
