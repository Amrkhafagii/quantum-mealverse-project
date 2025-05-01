
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import FitnessProfile from '@/components/fitness/FitnessProfile';
import MeasurementForm from '@/components/fitness/MeasurementForm';
import MeasurementsHistory from '@/components/fitness/MeasurementsHistory';
import SavedMealPlans from '@/components/fitness/SavedMealPlans';
import UserGoals from '@/components/fitness/UserGoals';
import EnhancedFitnessProfile from '@/components/fitness/EnhancedFitnessProfile';
import ProgressInsights from '@/components/fitness/ProgressInsights';
import { UserProfile, UserMeasurement } from '@/types/fitness';
import { getUserMeasurements } from '@/services/measurementService';
import { updateGoalStatusBasedOnProgress } from '@/services/goalTrackingService';
import { FitnessNotifications } from '@/components/ui/fitness-notification';

const FitnessProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [measurements, setMeasurements] = useState<UserMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchUserProfile();
    fetchMeasurements();
  }, [user, navigate]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fitness_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // not found is okay
        throw error;
      }

      setUserProfile(data as UserProfile);
      
      // Check goals when profile is loaded
      if (data) {
        updateGoalStatusBasedOnProgress(user.id);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeasurements = async () => {
    if (!user) return;

    try {
      const { data, error } = await getUserMeasurements(user.id);

      if (error) throw error;
      
      setMeasurements(data || []);
    } catch (error) {
      console.error('Error fetching measurements:', error);
    }
  };

  const handleProfileUpdate = async (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
  };

  const handleMeasurementAdded = async () => {
    await fetchMeasurements();
    // Check goals after adding a measurement
    if (user) {
      updateGoalStatusBasedOnProgress(user.id);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-quantum-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Please sign in to view your profile</p>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-quantum-purple hover:bg-quantum-purple/90"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-quantum-cyan mb-4 neon-text">
          Fitness Profile
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mb-6">
          Manage your health metrics, body measurements, and fitness goals in one place.
        </p>

        <div className="mb-8">
          <FitnessNotifications userId={user.id} limit={3} />
        </div>

        <EnhancedFitnessProfile userId={user.id} userProfile={userProfile || undefined} />
        
        <div className="mt-8">
          <ProgressInsights userId={user.id} />
        </div>
        
        <div className="mt-12">
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-quantum-darkBlue/50 w-full justify-start">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="measurements">Measurements</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="saved-plans">Saved Plans</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-6">
              <div className="bg-quantum-darkBlue/30 rounded-lg border border-quantum-cyan/20 p-6">
                <h2 className="text-2xl font-bold text-quantum-cyan mb-6">Personal Profile</h2>
                {loading ? (
                  <p>Loading profile...</p>
                ) : (
                  <FitnessProfile 
                    userId={user.id}
                  />
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="measurements" className="mt-6">
              <div className="bg-quantum-darkBlue/30 rounded-lg border border-quantum-cyan/20 p-6">
                <h2 className="text-2xl font-bold text-quantum-cyan mb-6">Body Measurements</h2>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-5 space-y-8">
                    <MeasurementForm 
                      userId={user.id} 
                      onMeasurementAdded={handleMeasurementAdded} 
                    />
                  </div>
                  <div className="lg:col-span-7">
                    <MeasurementsHistory 
                      userId={user.id}
                      measurements={measurements} 
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="goals" className="mt-6">
              <div className="bg-quantum-darkBlue/30 rounded-lg border border-quantum-cyan/20 p-6">
                <h2 className="text-2xl font-bold text-quantum-cyan mb-6">Fitness Goals</h2>
                <UserGoals 
                  userId={user.id}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="saved-plans" className="mt-6">
              <div className="bg-quantum-darkBlue/30 rounded-lg border border-quantum-cyan/20 p-6">
                <h2 className="text-2xl font-bold text-quantum-cyan mb-6">Saved Meal Plans</h2>
                <SavedMealPlans userId={user.id} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FitnessProfilePage;
