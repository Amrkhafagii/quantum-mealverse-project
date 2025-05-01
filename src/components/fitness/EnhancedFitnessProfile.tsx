
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserProfile, UserMeasurement, UserWorkoutStats } from '@/types/fitness';
import { Activity, Calendar, Award, TrendingUp, Dumbbell, Utensils, Target } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getWorkoutStats } from '@/services/workoutService';
import { getLatestMeasurement } from '@/services/measurementService';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import { useToast } from '@/hooks/use-toast';
import { getUserAchievements } from '@/services/achievementService';

interface EnhancedFitnessProfileProps {
  userId?: string;
  userProfile?: UserProfile;
}

const EnhancedFitnessProfile: React.FC<EnhancedFitnessProfileProps> = ({ userId, userProfile }) => {
  const { toast } = useToast();
  const { stats: workoutStats, loadWorkoutStats } = useWorkoutData();
  const [loading, setLoading] = useState(false);
  const [latestMeasurement, setLatestMeasurement] = useState<UserMeasurement | null>(null);
  const [achievements, setAchievements] = useState<any[]>([]);
  
  useEffect(() => {
    if (userId) {
      loadProfileData();
    }
  }, [userId]);
  
  const loadProfileData = async () => {
    if (!userId) return;
    
    setLoading(true);
    
    try {
      // Load workout stats if not already loaded
      if (!workoutStats) {
        loadWorkoutStats();
      }
      
      // Load latest measurements
      const { data: measurementData } = await getLatestMeasurement(userId);
      if (measurementData) {
        setLatestMeasurement(measurementData);
      }
      
      // Load user achievements
      const { data: achievementData } = await getUserAchievements(userId);
      if (achievementData) {
        setAchievements(achievementData);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const calculateBMI = () => {
    if (!latestMeasurement || !userProfile?.height) return null;
    
    // Height should be in meters, weight in kg
    const heightInMeters = userProfile.height / 100; // Convert cm to meters
    const bmi = latestMeasurement.weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };
  
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-400' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-yellow-400' };
    return { label: 'Obese', color: 'text-red-400' };
  };
  
  const bmi = calculateBMI();
  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;
  
  return (
    <div className="space-y-6">
      <Card className="bg-quantum-darkBlue/30 border border-quantum-cyan/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-quantum-cyan">Fitness Dashboard</CardTitle>
          <CardDescription>Your health and fitness journey at a glance</CardDescription>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Loading profile data...</p>
            </div>
          ) : (
            <>
              {/* Stats Overview Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {/* Weight Card */}
                <Card className="bg-quantum-black/50 border border-quantum-purple/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-gray-400 mb-1">Current Weight</p>
                      <p className="text-2xl font-bold text-quantum-cyan">
                        {latestMeasurement ? `${latestMeasurement.weight} kg` : 'Not set'}
                      </p>
                      {userProfile?.goal_weight && (
                        <p className="text-xs text-gray-500 mt-1">
                          Goal: {userProfile.goal_weight} kg
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* BMI Card */}
                <Card className="bg-quantum-black/50 border border-quantum-purple/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-gray-400 mb-1">BMI</p>
                      {bmi ? (
                        <>
                          <p className="text-2xl font-bold text-quantum-cyan">{bmi}</p>
                          <p className={`text-xs ${bmiCategory?.color} mt-1`}>
                            {bmiCategory?.label}
                          </p>
                        </>
                      ) : (
                        <p className="text-2xl font-bold text-quantum-cyan">--</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Workout Streak Card */}
                <Card className="bg-quantum-black/50 border border-quantum-purple/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-gray-400 mb-1">Current Streak</p>
                      <p className="text-2xl font-bold text-quantum-cyan">
                        {workoutStats?.currentStreak || 0} days
                      </p>
                      {workoutStats && workoutStats.longestStreak > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Best: {workoutStats.longestStreak} days
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Achievements Card */}
                <Card className="bg-quantum-black/50 border border-quantum-purple/20">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-gray-400 mb-1">Achievements</p>
                      <p className="text-2xl font-bold text-quantum-cyan">
                        {achievements.length}
                      </p>
                      {achievements.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Latest: {formatDistanceToNow(new Date(achievements[0].date_achieved), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* More Detailed Stats in Tabs */}
              <Tabs defaultValue="activity">
                <TabsList className="bg-quantum-black/50 mb-4">
                  <TabsTrigger value="activity">
                    <Activity className="h-4 w-4 mr-2" /> Activity
                  </TabsTrigger>
                  <TabsTrigger value="measurements">
                    <TrendingUp className="h-4 w-4 mr-2" /> Measurements
                  </TabsTrigger>
                  <TabsTrigger value="achievements">
                    <Award className="h-4 w-4 mr-2" /> Achievements
                  </TabsTrigger>
                  <TabsTrigger value="goals">
                    <Target className="h-4 w-4 mr-2" /> Goals
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="activity">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-quantum-black/30 border border-quantum-cyan/10">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-400 mb-1">Total Workouts</p>
                              <p className="text-xl font-medium">{workoutStats?.totalWorkouts || 0}</p>
                            </div>
                            <Dumbbell className="h-10 w-10 text-quantum-cyan/40" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-quantum-black/30 border border-quantum-cyan/10">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-400 mb-1">Workout Time</p>
                              <p className="text-xl font-medium">{workoutStats?.total_time || 0} mins</p>
                            </div>
                            <Calendar className="h-10 w-10 text-quantum-cyan/40" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-quantum-black/30 border border-quantum-cyan/10">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-gray-400 mb-1">Calories Burned</p>
                              <p className="text-xl font-medium">{workoutStats?.total_calories || 0}</p>
                            </div>
                            <Utensils className="h-10 w-10 text-quantum-cyan/40" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="bg-quantum-black/30 p-4 rounded-lg space-y-3">
                      <h3 className="text-lg font-medium text-quantum-cyan">Activity Insights</h3>
                      
                      {workoutStats && (
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-400">Favorite Exercise</p>
                            <p className="text-lg">{workoutStats.favorite_exercise}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-400">Strongest Exercise</p>
                            <p className="text-lg">
                              {workoutStats.strongest_exercise.exercise_name} - 
                              {workoutStats.strongest_exercise.max_weight}kg
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-400">Most Improved</p>
                            <p className="text-lg">
                              {workoutStats.most_improved_exercise.exercise_name} - 
                              {workoutStats.most_improved_exercise.improvement_percentage}% gain
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-400">Weekly Goal Completion</p>
                            <div className="w-full bg-quantum-darkBlue/80 h-2 rounded-full mt-1">
                              <div 
                                className="bg-quantum-cyan h-2 rounded-full" 
                                style={{ width: `${workoutStats.weekly_goal_completion}%` }}
                              />
                            </div>
                            <p className="text-right text-xs mt-1 text-gray-400">
                              {workoutStats.weekly_goal_completion}%
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {!workoutStats && (
                        <p className="text-gray-400">No workout data available yet. Start logging your workouts to see insights.</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="measurements">
                  <div className="space-y-6">
                    {latestMeasurement ? (
                      <>
                        <div className="bg-quantum-black/30 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-3">
                            <p className="text-lg font-medium text-quantum-cyan">Latest Measurements</p>
                            <p className="text-sm text-gray-400">
                              {formatDistanceToNow(new Date(latestMeasurement.date), { addSuffix: true })}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-400">Weight</p>
                              <p className="text-lg">{latestMeasurement.weight} kg</p>
                            </div>
                            
                            {latestMeasurement.body_fat !== null && (
                              <div>
                                <p className="text-sm text-gray-400">Body Fat</p>
                                <p className="text-lg">{latestMeasurement.body_fat}%</p>
                              </div>
                            )}
                            
                            {latestMeasurement.chest !== null && (
                              <div>
                                <p className="text-sm text-gray-400">Chest</p>
                                <p className="text-lg">{latestMeasurement.chest} cm</p>
                              </div>
                            )}
                            
                            {latestMeasurement.waist !== null && (
                              <div>
                                <p className="text-sm text-gray-400">Waist</p>
                                <p className="text-lg">{latestMeasurement.waist} cm</p>
                              </div>
                            )}
                            
                            {latestMeasurement.hips !== null && (
                              <div>
                                <p className="text-sm text-gray-400">Hips</p>
                                <p className="text-lg">{latestMeasurement.hips} cm</p>
                              </div>
                            )}
                            
                            {latestMeasurement.arms !== null && (
                              <div>
                                <p className="text-sm text-gray-400">Arms</p>
                                <p className="text-lg">{latestMeasurement.arms} cm</p>
                              </div>
                            )}
                            
                            {latestMeasurement.legs !== null && (
                              <div>
                                <p className="text-sm text-gray-400">Legs</p>
                                <p className="text-lg">{latestMeasurement.legs} cm</p>
                              </div>
                            )}
                          </div>
                          
                          {latestMeasurement.notes && (
                            <div className="mt-4 p-3 bg-quantum-darkBlue/50 rounded-md">
                              <p className="text-sm text-gray-400 mb-1">Notes</p>
                              <p className="text-sm">{latestMeasurement.notes}</p>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="bg-quantum-black/30 p-6 rounded-lg text-center">
                        <TrendingUp className="h-12 w-12 mx-auto text-quantum-cyan/40 mb-3" />
                        <p className="text-lg font-medium text-quantum-cyan mb-1">No Measurements Yet</p>
                        <p className="text-gray-400 mb-4">
                          Track your progress by adding body measurements regularly
                        </p>
                        <Button className="bg-quantum-purple hover:bg-quantum-purple/90">
                          Add Measurements
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="achievements">
                  <div className="space-y-6">
                    {achievements.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {achievements.slice(0, 6).map((achievement) => (
                          <Card key={achievement.id} className="bg-quantum-black/30 border border-quantum-purple/20">
                            <CardContent className="pt-6">
                              <div className="flex items-start">
                                <div className="bg-quantum-purple/20 p-2 rounded-lg mr-3">
                                  <Award className="h-6 w-6 text-quantum-purple" />
                                </div>
                                <div>
                                  <p className="font-medium">{achievement.achievement.name}</p>
                                  <p className="text-sm text-gray-400 mt-1">{achievement.achievement.description}</p>
                                  <p className="text-xs text-gray-500 mt-2">
                                    Earned {formatDistanceToNow(new Date(achievement.date_achieved), { addSuffix: true })}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-quantum-black/30 p-6 rounded-lg text-center">
                        <Award className="h-12 w-12 mx-auto text-quantum-cyan/40 mb-3" />
                        <p className="text-lg font-medium text-quantum-cyan mb-1">No Achievements Yet</p>
                        <p className="text-gray-400 mb-4">
                          Keep working on your fitness goals to earn achievements
                        </p>
                        <Button className="bg-quantum-purple hover:bg-quantum-purple/90">
                          View All Achievements
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="goals">
                  <div className="space-y-6">
                    <div className="bg-quantum-black/30 p-4 rounded-lg">
                      <p className="text-lg font-medium text-quantum-cyan mb-3">Active Goals</p>
                      
                      {userProfile?.fitness_goals && userProfile.fitness_goals.length > 0 ? (
                        <div className="space-y-3">
                          {userProfile.fitness_goals.map((goal, index) => (
                            <div key={index} className="flex items-center bg-quantum-darkBlue/30 p-3 rounded-md">
                              <div className="mr-3">
                                <Target className="h-5 w-5 text-quantum-cyan/70" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{goal}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">No fitness goals set yet. Define your goals to track your progress.</p>
                      )}
                      
                      {userProfile?.goal_weight && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-400 mb-2">Weight Goal Progress</p>
                          <div className="flex items-center">
                            <p className="text-sm mr-3">{latestMeasurement?.weight || '?'} kg</p>
                            <div className="flex-1 bg-quantum-darkBlue/80 h-2 rounded-full">
                              {latestMeasurement && userProfile.goal_weight && (
                                <div 
                                  className="bg-quantum-cyan h-2 rounded-full" 
                                  style={{ 
                                    width: `${Math.min(100, Math.max(0, 
                                      latestMeasurement.weight <= userProfile.goal_weight 
                                        ? 100 // At or below goal weight
                                        : 100 - ((latestMeasurement.weight - userProfile.goal_weight) / 
                                                (latestMeasurement.weight * 0.2)) * 100 // Progress percentage
                                    ))}%` 
                                  }}
                                />
                              )}
                            </div>
                            <p className="text-sm ml-3">{userProfile.goal_weight} kg</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedFitnessProfile;
