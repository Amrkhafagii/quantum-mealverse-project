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

const FitnessProfile: React.FC<FitnessProfileProps> = ({ userId, onUpdateProfile }) => {
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<Partial<UserProfile> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>();

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('fitness_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (error) throw error;
      
      // Ensure we have the required weight field
      const profileWithDefaults = {
        ...data,
        weight: data.weight || 0 // Add default weight if missing
      };
      
      setUserProfile(profileWithDefaults);
      
      // Set date if available
      if (profileWithDefaults.date_of_birth) {
        setDate(new Date(profileWithDefaults.date_of_birth));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        description: "Failed to load fitness profile."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (formData: Partial<UserProfile>) => {
    try {
      setIsLoading(true);
      
      // Ensure the weight is set with a default if not provided
      const profileData = {
        ...formData,
        weight: formData.weight || 0, // Add default weight value
        user_id: userId,
        // Convert Date object to ISO string for database storage
        date_of_birth: date ? date.toISOString() : null
      };
      
      const { data, error } = await supabase
        .from('fitness_profiles')
        .upsert(profileData)
        .select()
        .single();
        
      if (error) throw error;
      
      // Convert the data to UserProfile type with proper casting
      const updatedProfile = {
        ...data,
        weight: data.weight || 0, // Ensure weight is included
      };
      
      setUserProfile(updatedProfile);
      if (onUpdateProfile) onUpdateProfile(updatedProfile as UserProfile);
      
      toast({
        description: "Your fitness profile has been saved successfully."
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
              defaultValue={userProfile?.display_name || ""}
              onChange={(e) => userProfile && setUserProfile({ ...userProfile, display_name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              type="number"
              id="height"
              defaultValue={userProfile?.height || ""}
              onChange={(e) => userProfile && setUserProfile({ ...userProfile, height: parseFloat(e.target.value) })}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              type="number"
              id="weight"
              defaultValue={userProfile?.weight || ""}
              onChange={(e) => userProfile && setUserProfile({ ...userProfile, weight: parseFloat(e.target.value) })}
              required
            />
          </div>
          <div>
            <Label htmlFor="goal_weight">Goal Weight (kg)</Label>
            <Input
              type="number"
              id="goal_weight"
              defaultValue={userProfile?.goal_weight || ""}
              onChange={(e) => userProfile && setUserProfile({ ...userProfile, goal_weight: parseFloat(e.target.value) })}
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
              defaultValue={userProfile?.gender || ""}
              onValueChange={(value) => userProfile && setUserProfile({ ...userProfile, gender: value })}
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
              defaultValue={userProfile?.fitness_level || ""}
              onValueChange={(value) => userProfile && setUserProfile({ ...userProfile, fitness_level: value })}
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
          onClick={() => userProfile && handleUpdateProfile(userProfile)}
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
