
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/fitness';
import { useToast } from '@/hooks/use-toast';

interface FitnessProfileProps {
  userId: string;
  onUpdateProfile?: (profile: UserProfile) => void;
}

const FitnessProfile: React.FC<FitnessProfileProps> = ({ userId, onUpdateProfile }) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    user_id: userId,
    height: 0,
    weight: 0,
    age: 0,
    gender: 'male',
    activity_level: 'moderately_active',
    fitness_goal: 'maintain',
    goal_weight: 0,
    fitness_level: 'beginner',
    display_name: '',
    fitness_goals: [],
    dietary_preferences: [],
    dietary_restrictions: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('fitness_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          ...data,
          gender: data.gender as 'male' | 'female' | 'other' || 'male',
          weight: data.weight || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const profileData = {
        ...profile,
        user_id: userId,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('fitness_profiles')
        .upsert(profileData)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          ...data,
          gender: data.gender as 'male' | 'female' | 'other' || 'male',
          weight: data.weight || 0,
        });
        
        if (onUpdateProfile) {
          onUpdateProfile(data as UserProfile);
        }
        
        toast({
          title: "Success",
          description: "Profile updated successfully!"
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="text-quantum-cyan">Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={profile.display_name || ''}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                placeholder="Your display name"
              />
            </div>
            
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={profile.age || ''}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                placeholder="Your age"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={profile.height || ''}
                onChange={(e) => handleInputChange('height', parseInt(e.target.value))}
                placeholder="Your height in cm"
              />
            </div>
            
            <div>
              <Label htmlFor="weight">Current Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={profile.weight || ''}
                onChange={(e) => handleInputChange('weight', parseInt(e.target.value))}
                placeholder="Your current weight in kg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="goal_weight">Goal Weight (kg)</Label>
              <Input
                id="goal_weight"
                type="number"
                value={profile.goal_weight || ''}
                onChange={(e) => handleInputChange('goal_weight', parseInt(e.target.value))}
                placeholder="Your goal weight in kg"
              />
            </div>
            
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select 
                value={profile.gender || 'male'} 
                onValueChange={(value: 'male' | 'female' | 'other') => handleInputChange('gender', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="activity_level">Activity Level</Label>
              <Select 
                value={profile.activity_level || 'moderately_active'} 
                onValueChange={(value) => handleInputChange('activity_level', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="lightly_active">Lightly Active</SelectItem>
                  <SelectItem value="moderately_active">Moderately Active</SelectItem>
                  <SelectItem value="very_active">Very Active</SelectItem>
                  <SelectItem value="extra_active">Extra Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="fitness_goal">Primary Fitness Goal</Label>
              <Select 
                value={profile.fitness_goal || 'maintain'} 
                onValueChange={(value) => handleInputChange('fitness_goal', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fitness goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lose_weight">Lose Weight</SelectItem>
                  <SelectItem value="gain_muscle">Gain Muscle</SelectItem>
                  <SelectItem value="maintain">Maintain</SelectItem>
                  <SelectItem value="improve_endurance">Improve Endurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="fitness_level">Fitness Level</Label>
            <Select 
              value={profile.fitness_level || 'beginner'} 
              onValueChange={(value) => handleInputChange('fitness_level', value)}
            >
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

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-quantum-purple hover:bg-quantum-purple/90"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FitnessProfile;
