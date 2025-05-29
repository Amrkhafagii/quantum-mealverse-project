
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FitnessOverview } from '@/components/fitness/FitnessOverview';
import WorkoutPlanner from '@/components/fitness/WorkoutPlanner';
import WorkoutScheduler from '@/components/fitness/WorkoutScheduler';
import WorkoutHistory from '@/components/fitness/WorkoutHistory';
import WorkoutRecommendations from '@/components/fitness/WorkoutRecommendations';
import UserAchievements from '@/components/fitness/UserAchievements';
import { Trophy } from 'lucide-react';

const FitnessPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const workoutData = useWorkoutData();
  
  return (
    <div className="min-h-screen bg-quantum-black text-white">
      <ParticleBackground />
      <Navbar />
      
      <main className="container mx-auto pt-24 pb-12 px-4 relative z-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-quantum-cyan mb-6 neon-text">
          Fitness Dashboard
        </h1>
        
        <div className="mt-6">
          <Tabs 
            defaultValue={activeTab} 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="overflow-x-auto pb-2">
              <TabsList className="bg-quantum-darkBlue/50 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="planner">Workout Planner</TabsTrigger>
                <TabsTrigger value="scheduler">Scheduler</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="achievements" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Achievements
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="overview" className="mt-2">
              <FitnessOverview userId={user?.id} workoutStats={workoutData.workoutStats} />
            </TabsContent>
            
            <TabsContent value="planner" className="mt-2">
              <WorkoutPlanner />
            </TabsContent>
            
            <TabsContent value="scheduler" className="mt-2">
              <WorkoutScheduler />
            </TabsContent>
            
            <TabsContent value="history" className="mt-2">
              <WorkoutHistory
                userId={user?.id}
                workoutHistory={workoutData.history}
                isLoading={workoutData.isLoading}
              />
            </TabsContent>
            
            <TabsContent value="recommendations" className="mt-2">
              <WorkoutRecommendations
                userId={user?.id}
                onApplied={workoutData.fetchWorkoutPlans}
              />
            </TabsContent>
            
            <TabsContent value="achievements" className="mt-2">
              <UserAchievements userId={user?.id} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FitnessPage;
