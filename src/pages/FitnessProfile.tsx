
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import ParticleBackground from '@/components/ParticleBackground';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserProfile, UserMeasurement } from '@/types/fitness';
import { useAuth } from '@/hooks/useAuth';
import MeasurementsHistory from '@/components/fitness/MeasurementsHistory';
import SavedMealPlans from '@/components/fitness/SavedMealPlans';
import UserGoals from '@/components/fitness/UserGoals';
import UserAchievements from '@/components/fitness/UserAchievements';

const FitnessProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [measurements, setMeasurements] = useState<UserMeasurement[]>([]);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [height, setHeight] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      loadProfile();
      loadMeasurements();
    }
  }, [user, loading]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('fitness_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name || '');
        setGender(data.gender || '');
        setDob(data.date_of_birth || '');
        setHeight(data.height?.toString() || '');
        setGoalWeight(data.goal_weight?.toString() || '');
        setFitnessLevel(data.fitness_level || 'beginner');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadMeasurements = async () => {
    try {
      const { data, error } = await supabase
        .from('user_measurements')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      if (error) throw error;

      if (data) {
        setMeasurements(data);
        
        // Set current weight from latest measurement if available
        if (data.length > 0) {
          setCurrentWeight(data[0].weight.toString());
          if (data[0].body_fat) setBodyFat(data[0].body_fat.toString());
        }
      }
    } catch (error) {
      console.error('Error loading measurements:', error);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      
      const profileData = {
        user_id: user?.id,
        display_name: displayName,
        gender,
        date_of_birth: dob || null,
        height: height ? parseFloat(height) : null,
        goal_weight: goalWeight ? parseFloat(goalWeight) : null,
        fitness_level: fitnessLevel,
        updated_at: new Date().toISOString()
      };
      
      // If profile exists, update it; otherwise create new profile
      if (profile?.id) {
        const { error } = await supabase
          .from('fitness_profiles')
          .update(profileData)
          .eq('id', profile.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('fitness_profiles')
          .insert([{
            ...profileData,
            created_at: new Date().toISOString()
          }]);
          
        if (error) throw error;
      }
      
      // Add new measurement
      if (currentWeight) {
        const { error } = await supabase
          .from('user_measurements')
          .insert([{
            user_id: user?.id,
            date: new Date().toISOString(),
            weight: parseFloat(currentWeight),
            body_fat: bodyFat ? parseFloat(bodyFat) : null
          }]);
          
        if (error) throw error;
      }
      
      await loadProfile();
      await loadMeasurements();
      
      toast({
        title: "Profile Updated",
        description: "Your fitness profile has been updated successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-quantum-black text-white flex items-center justify-center">
        <div className="text-2xl text-quantum-cyan">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quantum-black text-white relative">
      <ParticleBackground />
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <h1 className="text-4xl font-bold text-quantum-cyan mb-8 neon-text">Fitness Profile</h1>
        
        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="measurements">Measurements</TabsTrigger>
            <TabsTrigger value="meal-plans">Saved Meal Plans</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="holographic-card">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Your basic information helps us tailor recommendations to you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="How you want to be addressed"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="holographic-card">
                <CardHeader>
                  <CardTitle>Physical Information</CardTitle>
                  <CardDescription>
                    These measurements help calculate your nutritional needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="Your height in centimeters"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currentWeight">Current Weight (kg)</Label>
                      <Input
                        id="currentWeight"
                        type="number"
                        value={currentWeight}
                        onChange={(e) => setCurrentWeight(e.target.value)}
                        placeholder="Your current weight in kilograms"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bodyFat">Body Fat % (optional)</Label>
                      <Input
                        id="bodyFat"
                        type="number"
                        value={bodyFat}
                        onChange={(e) => setBodyFat(e.target.value)}
                        placeholder="Your estimated body fat percentage"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="holographic-card">
                <CardHeader>
                  <CardTitle>Fitness Goals</CardTitle>
                  <CardDescription>
                    Tell us about your fitness aspirations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="goalWeight">Goal Weight (kg)</Label>
                      <Input
                        id="goalWeight"
                        type="number"
                        value={goalWeight}
                        onChange={(e) => setGoalWeight(e.target.value)}
                        placeholder="Your target weight in kilograms"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fitnessLevel">Fitness Level</Label>
                      <Select value={fitnessLevel} onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => setFitnessLevel(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fitness level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="md:col-span-2">
                <Button 
                  onClick={saveProfile} 
                  disabled={saving}
                  className="w-full bg-quantum-cyan hover:bg-quantum-cyan/90"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="measurements">
            <MeasurementsHistory 
              measurements={measurements}
              onMeasurementAdded={loadMeasurements}
            />
          </TabsContent>
          
          <TabsContent value="meal-plans">
            <SavedMealPlans userId={user?.id} />
          </TabsContent>
          
          <TabsContent value="goals">
            <UserGoals userId={user?.id} />
          </TabsContent>
          
          <TabsContent value="achievements">
            <UserAchievements userId={user?.id} />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default FitnessProfile;
