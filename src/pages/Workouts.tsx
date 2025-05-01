
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dumbbell, LineChart, History, PlayCircle, Calendar, Award, Goal, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import WorkoutPlanner from '@/components/fitness/WorkoutPlanner';
import WorkoutScheduler from '@/components/fitness/WorkoutScheduler';
import WorkoutHistory from '@/components/fitness/WorkoutHistory';
import ExerciseLibrary from '@/components/fitness/ExerciseLibrary';
import AchievementSystem from '@/components/fitness/AchievementSystem';
import AdvancedProgressCharts from '@/components/fitness/AdvancedProgressCharts';
import GoalManagement from '@/components/fitness/GoalManagement';
import StartWorkout from '@/components/fitness/StartWorkout';
import { supabase } from '@/integrations/supabase/client';
import { WorkoutPlan, UserMeasurement } from '@/types/fitness';
import { getUserMeasurements } from '@/services/measurementService';

const Workouts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('workout');
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [measurements, setMeasurements] = useState<UserMeasurement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadMeasurements();
    }
  }, [user]);
  
  const loadMeasurements = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await getUserMeasurements(user.id);

      if (error) throw error;
      
      setMeasurements(data || []);
    } catch (error) {
      console.error('Error loading measurements:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePlanSelect = (plan: WorkoutPlan) => {
    setSelectedPlan(plan);
    setActiveTab('schedule');
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case 'workout':
        return <StartWorkout userId={user?.id} />;
        
      case 'plans':
        return <WorkoutPlanner userId={user?.id} onPlanSelect={handlePlanSelect} />;
        
      case 'schedule':
        return selectedPlan ? (
          <WorkoutScheduler 
            userId={user?.id}
            plan={selectedPlan}
          />
        ) : (
          <Card className="w-full bg-quantum-darkBlue/30 border-quantum-cyan/20">
            <CardContent className="pt-6 text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-quantum-cyan" />
              <h2 className="text-2xl font-bold mb-4">Select a Workout Plan First</h2>
              <p className="text-gray-300 mb-6">
                Please select or create a workout plan to view your schedule.
              </p>
              
              <Button
                onClick={() => setActiveTab('plans')}
                className="bg-quantum-cyan hover:bg-quantum-cyan/90"
              >
                Select a Plan
              </Button>
            </CardContent>
          </Card>
        );
      
      case 'history':
        return <WorkoutHistory userId={user?.id} />;
        
      case 'track':
        return <AdvancedProgressCharts userId={user?.id} measurements={measurements} />;
        
      case 'exercises':
        return <ExerciseLibrary userId={user?.id} />;
        
      case 'achievements':
        return <AchievementSystem userId={user?.id} />;
        
      case 'goals':
        return <GoalManagement userId={user?.id} />;
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-quantum-cyan mb-4 neon-text">
          HealthAndFix Workouts
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mb-12">
          Find the perfect workout routine to match your fitness level and goals.
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="w-full max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8">
            <TabsTrigger value="workout" className="flex items-center gap-1">
              <PlayCircle className="h-4 w-4" /> Workout
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-1">
              <Dumbbell className="h-4 w-4" /> Plans
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> Schedule
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <History className="h-4 w-4" /> History
            </TabsTrigger>
            <TabsTrigger value="exercises" className="flex items-center gap-1">
              <PlayCircle className="h-4 w-4" /> Exercises
            </TabsTrigger>
            <TabsTrigger value="track" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-1">
              <Goal className="h-4 w-4" /> Goals
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-1">
              <Award className="h-4 w-4" /> Achievements
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-8">
            {renderContent()}
          </TabsContent>
        </Tabs>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-quantum-darkBlue/30 rounded-lg p-6 border border-quantum-cyan/20">
            <h3 className="text-xl font-bold text-quantum-cyan mb-3">Evidence-Based Training</h3>
            <p className="text-gray-300">
              Our workout plans are designed by certified trainers and based on scientific research
              to ensure optimal results while minimizing injury risk.
            </p>
          </div>
          
          <div className="bg-quantum-darkBlue/30 rounded-lg p-6 border border-quantum-cyan/20">
            <h3 className="text-xl font-bold text-quantum-cyan mb-3">Progress Tracking</h3>
            <p className="text-gray-300">
              Track your strength gains, body measurements, and workout consistency to stay
              motivated and see your improvements over time.
            </p>
          </div>
          
          <div className="bg-quantum-darkBlue/30 rounded-lg p-6 border border-quantum-cyan/20">
            <h3 className="text-xl font-bold text-quantum-cyan mb-3">Integrated Approach</h3>
            <p className="text-gray-300">
              Combine nutrition planning with workout routines for a holistic approach to
              health and fitness that maximizes your results.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Workouts;
