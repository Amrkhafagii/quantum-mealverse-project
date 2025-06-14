
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/fitness/profile';

export const FitnessProfile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({
    display_name: '',
    height: undefined,
    weight: 0,
    goal_weight: undefined,
    date_of_birth: '',
    gender: '',
    fitness_level: '',
    fitness_goals: [],
    dietary_preferences: [],
    dietary_restrictions: [],
    activity_level: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to update your profile",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const profilePayload = {
        fitness_profiles_user_id: user.id,
        display_name: profileData.display_name,
        height: profileData.height,
        weight: profileData.weight || 0,
        goal_weight: profileData.goal_weight,
        date_of_birth: profileData.date_of_birth,
        gender: profileData.gender,
        fitness_level: profileData.fitness_level,
        fitness_goals: profileData.fitness_goals || [],
        dietary_preferences: profileData.dietary_preferences || [],
        dietary_restrictions: profileData.dietary_restrictions || [],
        activity_level: profileData.activity_level,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('fitness_profiles')
        .upsert(profilePayload, { 
          onConflict: 'fitness_profiles_user_id' 
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your fitness profile has been successfully updated.",
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="bg-quantum-black/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="text-quantum-cyan">Fitness Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <Input
                value={profileData.display_name || ''}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                placeholder="Enter your display name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Height (cm)</label>
              <Input
                type="number"
                value={profileData.height || ''}
                onChange={(e) => handleInputChange('height', Number(e.target.value))}
                placeholder="Enter your height"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Weight (kg)</label>
              <Input
                type="number"
                value={profileData.weight || ''}
                onChange={(e) => handleInputChange('weight', Number(e.target.value))}
                placeholder="Enter your current weight"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Goal Weight (kg)</label>
              <Input
                type="number"
                value={profileData.goal_weight || ''}
                onChange={(e) => handleInputChange('goal_weight', Number(e.target.value))}
                placeholder="Enter your goal weight"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date of Birth</label>
              <Input
                type="date"
                value={profileData.date_of_birth || ''}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Gender</label>
              <Select value={profileData.gender || ''} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fitness Level</label>
              <Select value={profileData.fitness_level || ''} onValueChange={(value) => handleInputChange('fitness_level', value)}>
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

            <div>
              <label className="block text-sm font-medium mb-2">Activity Level</label>
              <Select value={profileData.activity_level || ''} onValueChange={(value) => handleInputChange('activity_level', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="lightly_active">Lightly Active</SelectItem>
                  <SelectItem value="moderately_active">Moderately Active</SelectItem>
                  <SelectItem value="very_active">Very Active</SelectItem>
                  <SelectItem value="extremely_active">Extremely Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-quantum-purple hover:bg-quantum-purple/90"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
