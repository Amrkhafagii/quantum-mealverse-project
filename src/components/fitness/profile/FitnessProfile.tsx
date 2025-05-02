
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from 'date-fns';
import { UserProfile } from '@/types/fitness';

interface FitnessProfileProps {
  userId?: string;
  onUpdateProfile?: (profile: UserProfile) => void;
}

interface ProfileFormState {
  display_name?: string;
  height?: number;
  weight: number;
  goal_weight?: number;
  date_of_birth?: Date | string | null;
  gender?: string;
  fitness_level?: string;
  fitness_goals?: string[];
  dietary_preferences?: string[];
  dietary_restrictions?: string[];
}

const FitnessProfile: React.FC<FitnessProfileProps> = ({ userId, onUpdateProfile }) => {
  const [profile, setProfile] = useState<ProfileFormState>({
    weight: 0, // Initialize with default required value
  });
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = React.useState<Date | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      if (!userId) return;
      
      const { data, error } = await supabase
        .from('fitness_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Convert to our internal state format with guaranteed weight property
        const profileData: ProfileFormState = {
          display_name: data.display_name,
          height: data.height,
          weight: data.weight || 0, // Ensure weight has a default value
          goal_weight: data.goal_weight,
          date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : null,
          gender: data.gender,
          fitness_level: data.fitness_level,
          fitness_goals: data.fitness_goals,
          dietary_preferences: data.dietary_preferences,
          dietary_restrictions: data.dietary_restrictions,
        };
        
        setProfile(profileData);
        
        // Set date if available
        if (data.date_of_birth) {
          setDate(new Date(data.date_of_birth));
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        description: "Failed to load fitness profile.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      if (!userId) return;
      
      // Ensure the weight is set with a default if not provided
      const profileData = {
        ...profile,
        user_id: userId,
        date_of_birth: date?.toISOString() || null
      };
      
      const { data, error } = await supabase
        .from('fitness_profiles')
        .upsert(profileData as any)
        .select()
        .single();
        
      if (error) throw error;
      
      // Convert the data to UserProfile type with proper casting
      const updatedProfile = data as unknown as UserProfile;
      
      if (onUpdateProfile) {
        onUpdateProfile(updatedProfile);
      }
      
      toast({
        description: "Your fitness profile has been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        description: "Failed to update fitness profile.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileFormState, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="text-quantum-cyan">Update Your Profile</CardTitle>
        <CardDescription>
          Customize your fitness profile to get the most out of our services.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              type="text"
              id="display_name"
              value={profile.display_name || ""}
              onChange={(e) => handleInputChange('display_name', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              type="number"
              id="height"
              value={profile.height || ""}
              onChange={(e) => handleInputChange('height', parseFloat(e.target.value))}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              type="number"
              id="weight"
              value={profile.weight || ""}
              onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))}
              required
            />
          </div>
          <div>
            <Label htmlFor="goal_weight">Goal Weight (kg)</Label>
            <Input
              type="number"
              id="goal_weight"
              value={profile.goal_weight || ""}
              onChange={(e) => handleInputChange('goal_weight', parseFloat(e.target.value))}
            />
          </div>
        </div>
        <div>
          <Label>Date of Birth</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) =>
                  date > new Date() || date < new Date('1900-01-01')
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select 
              value={profile.gender || ""} 
              onValueChange={(value) => handleInputChange('gender', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="fitness_level">Fitness Level</Label>
            <Select 
              value={profile.fitness_level || ""} 
              onValueChange={(value) => handleInputChange('fitness_level', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button 
          onClick={handleUpdateProfile}
          className="bg-quantum-purple hover:bg-quantum-purple/90"
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Update Profile"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FitnessProfile;
