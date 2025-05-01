
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LineChart, Activity, Dumbbell, UserCircle, Target, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UserMeasurement } from '@/types/fitness';

// Import components for each tab
import UserGoals from '@/components/fitness/UserGoals';
import UserAchievements from '@/components/fitness/UserAchievements';
import SavedMealPlans from '@/components/fitness/SavedMealPlans';
import MeasurementsHistory from '@/components/fitness/MeasurementsHistory';
import FitnessProfile from '@/components/fitness/FitnessProfile';
import ProgressAnalytics from '@/components/fitness/ProgressAnalytics';

const FitnessProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [measurements, setMeasurements] = useState<UserMeasurement[]>([]);
  
  useEffect(() => {
    if (user) {
      loadMeasurements();
    }
  }, [user]);
  
  const loadMeasurements = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      
      setMeasurements(data || []);
    } catch (error) {
      console.error('Error loading measurements:', error);
    }
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-quantum-black text-white relative">
        <ParticleBackground />
        <Navbar />
        
        <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
          <Card className="bg-quantum-darkBlue/30 border border-quantum-cyan/20">
            <CardContent className="pt-6 text-center">
              <UserCircle className="h-16 w-16 mx-auto mb-4 text-quantum-cyan" />
              <h2 className="text-2xl font-bold mb-4">Login Required</h2>
              <p className="text-gray-300 mb-6">
                Please log in to view and manage your fitness profile.
              </p>
              
              <Button
                onClick={() => navigate('/auth')}
                className="bg-quantum-cyan hover:bg-quantum-cyan/90"
              >
                Login / Register
              </Button>
            </CardContent>
          </Card>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-quantum-cyan mb-8 neon-text">
          Your Fitness Profile
        </h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="w-full max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserCircle className="h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="measurements" className="flex items-center gap-2">
              <Activity className="h-4 w-4" /> Measurements
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" /> Goals
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" /> Progress
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Award className="h-4 w-4" /> Achievements
            </TabsTrigger>
            <TabsTrigger value="meal-plans" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" /> Meal Plans
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-8">
            <FitnessProfile userId={user.id} />
          </TabsContent>
          
          <TabsContent value="measurements" className="mt-8">
            <MeasurementsHistory userId={user.id} />
          </TabsContent>
          
          <TabsContent value="goals" className="mt-8">
            <UserGoals userId={user.id} />
          </TabsContent>
          
          <TabsContent value="progress" className="mt-8">
            <ProgressAnalytics userId={user.id} measurements={measurements} />
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-8">
            <UserAchievements userId={user.id} />
          </TabsContent>
          
          <TabsContent value="meal-plans" className="mt-8">
            <SavedMealPlans userId={user.id} />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-center mt-8">
          <Button 
            onClick={() => navigate('/workouts')}
            className="bg-quantum-purple hover:bg-quantum-purple/90"
          >
            <Dumbbell className="mr-2 h-4 w-4" /> Go to Workout Planner
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default FitnessProfilePage;
