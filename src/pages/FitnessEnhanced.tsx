
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
import { ChallengesList } from '@/components/fitness/social/ChallengesList';
import { WorkoutDataExport } from '@/components/fitness/export/WorkoutDataExport';
import { Timer, Users, Download, Trophy, Target, Calendar } from 'lucide-react';

const FitnessEnhancedPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const workoutData = useWorkoutData();
  
  return (
    <div className="min-h-screen bg-quantum-black text-white">
      <ParticleBackground />
      <Navbar />
      
      <main className="container mx-auto pt-24 pb-12 px-4 relative z-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-quantum-cyan mb-6 neon-text">
          Enhanced Fitness Dashboard
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
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="planner" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Planner
                </TabsTrigger>
                <TabsTrigger value="scheduler" className="flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  Scheduler
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  History
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  AI Recommendations
                </TabsTrigger>
                <TabsTrigger value="challenges" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Challenges
                </TabsTrigger>
                <TabsTrigger value="export" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Data
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
            
            <TabsContent value="challenges" className="mt-2">
              <ChallengesList />
            </TabsContent>
            
            <TabsContent value="export" className="mt-2">
              <WorkoutDataExport />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FitnessEnhancedPage;
