
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FitnessOverview } from '@/components/fitness/FitnessOverview';
// Import components correctly
import WorkoutPlanner from '@/components/fitness/WorkoutPlanner';
import WorkoutScheduler from '@/components/fitness/WorkoutScheduler';
import WorkoutHistory from '@/components/fitness/WorkoutHistory';
import WorkoutRecommendations from '@/components/fitness/WorkoutRecommendations';

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
              </TabsList>
            </div>
            
            <TabsContent value="overview" className="mt-2">
              <FitnessOverview userId={user?.id} workoutStats={workoutData.workoutStats} />
            </TabsContent>
            
            <TabsContent value="planner" className="mt-2">
              <WorkoutPlanner 
                userId={user?.id} 
                workoutPlans={workoutData.workoutPlans} 
                isLoading={workoutData.isLoading}
                onWorkoutPlanCreated={workoutData.fetchWorkoutPlans} 
              />
            </TabsContent>
            
            <TabsContent value="scheduler" className="mt-2">
              <WorkoutScheduler 
                userId={user?.id} 
                schedules={workoutData.schedules}
                onScheduleCreated={workoutData.fetchWorkoutPlans}
                refreshSchedules={workoutData.fetchWorkoutSchedules}
                refreshHistory={workoutData.fetchWorkoutHistory}
                logWorkout={async (workoutLog) => {
                  const result = await workoutData.logWorkout(workoutLog);
                  return result.success;
                }}
              />
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
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FitnessPage;
