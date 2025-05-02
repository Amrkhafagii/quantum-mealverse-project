import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { CheckCircle, Circle, RefreshCw, Clock, Award, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { DailyQuest } from '@/types/fitness';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DailyQuestsProps {
  userId?: string;
  userLevel?: number;
  userPreferences?: any;
}

const DailyQuests: React.FC<DailyQuestsProps> = ({ 
  userId,
  userLevel = 1,
  userPreferences = {}
}) => {
  const { toast } = useToast();
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    if (userId) {
      loadQuests();
    } else {
      setLoading(false);
    }
  }, [userId, userLevel]);
  
  const loadQuests = async () => {
    setLoading(true);
    
    try {
      setTimeout(() => {
        // Generate adaptive quests based on user level and preferences
        const generatedQuests = generateAdaptiveQuests(userId || '', userLevel, userPreferences);
        setQuests(generatedQuests);
        setLoading(false);
      }, 800);
      
      // In a real app with a database:
      /*
      // First check if user has quests for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('daily_quests')
        .select('*')
        .eq('user_id', userId)
        .gte('expires_at', today.toISOString());
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // User has quests for today
        setQuests(data);
      } else {
        // Generate new quests for today
        const generatedQuests = generateAdaptiveQuests(userId || '', userLevel, userPreferences);
        
        // Save to database
        const expiryDate = new Date();
        expiryDate.setHours(23, 59, 59, 999);
        
        const questsToSave = generatedQuests.map(quest => ({
          ...quest,
          expires_at: expiryDate.toISOString()
        }));
        
        const { error: insertError } = await supabase
          .from('daily_quests')
          .insert(questsToSave);
          
        if (insertError) throw insertError;
        
        setQuests(generatedQuests);
      }
      */
    } catch (error) {
      console.error('Error loading daily quests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load daily quests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const generateAdaptiveQuests = (userId: string, level: number, preferences: any): DailyQuest[] => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    // Base quests that everyone gets
    const baseQuests: DailyQuest[] = [
      {
        id: '1',
        user_id: userId,
        title: 'Daily Workout',
        description: 'Complete any workout session today',
        type: 'workout',
        points: 20,
        difficulty: 'easy',
        icon: 'workout',
        completed: false,
        created_at: now.toISOString(),
        expires_at: tomorrow.toISOString()
      },
      {
        id: '2',
        user_id: userId,
        title: 'Hydration Goal',
        description: 'Log drinking at least 8 cups of water',
        type: 'wellness',
        points: 10,
        difficulty: 'easy',
        icon: 'water',
        completed: false,
        created_at: now.toISOString(),
        expires_at: tomorrow.toISOString()
      }
    ];
    
    // Beginner level quests
    if (level <= 2) {
      baseQuests.push(
        {
          id: '3',
          user_id: userId,
          title: 'Morning Stretch',
          description: 'Complete a 5-minute stretching routine',
          type: 'workout',
          points: 10,
          difficulty: 'easy',
          icon: 'stretch',
          completed: false,
          created_at: now.toISOString(),
          expires_at: tomorrow.toISOString()
        },
        {
          id: '4',
          user_id: userId,
          title: 'Step Goal',
          description: 'Reach 5,000 steps today',
          type: 'steps',
          points: 15,
          difficulty: 'easy',
          icon: 'steps',
          completed: false,
          created_at: now.toISOString(),
          expires_at: tomorrow.toISOString()
        }
      );
    }
    
    // Intermediate level quests
    if (level >= 3 && level <= 5) {
      baseQuests.push(
        {
          id: '5',
          user_id: userId,
          title: 'Cardio Session',
          description: 'Complete 20 minutes of cardio exercise',
          type: 'workout',
          points: 20,
          difficulty: 'medium',
          icon: 'cardio',
          completed: false,
          created_at: now.toISOString(),
          expires_at: tomorrow.toISOString()
        },
        {
          id: '6',
          user_id: userId,
          title: 'Step Goal',
          description: 'Reach 8,000 steps today',
          type: 'steps',
          points: 20,
          difficulty: 'medium',
          icon: 'steps',
          completed: false,
          created_at: now.toISOString(),
          expires_at: tomorrow.toISOString()
        }
      );
    }
    
    // Advanced level quests
    if (level >= 6) {
      baseQuests.push(
        {
          id: '7',
          user_id: userId,
          title: 'High-Intensity Workout',
          description: 'Complete a workout with at least 400 calories burned',
          type: 'workout',
          points: 30,
          difficulty: 'hard',
          icon: 'hiit',
          completed: false,
          created_at: now.toISOString(),
          expires_at: tomorrow.toISOString()
        },
        {
          id: '8',
          user_id: userId,
          title: 'Step Goal',
          description: 'Reach 10,000 steps today',
          type: 'steps',
          points: 25,
          difficulty: 'hard',
          icon: 'steps',
          completed: false,
          created_at: now.toISOString(),
          expires_at: tomorrow.toISOString()
        }
      );
    }
    
    // Add bonus quest if user has reached level 10
    if (level >= 10) {
      baseQuests.push({
        id: '9',
        user_id: userId,
        title: 'Elite Challenge',
        description: 'Complete 2 workouts in a single day',
        type: 'workout',
        points: 50,
        difficulty: 'hard',
        icon: 'elite',
        completed: false,
        created_at: now.toISOString(),
        expires_at: tomorrow.toISOString()
      });
    }
    
    // Select a random assortment of quests (3-5 depending on level)
    const questCount = Math.min(baseQuests.length, Math.floor(3 + level / 3));
    const shuffled = [...baseQuests].sort(() => 0.5 - Math.random());
    
    return shuffled.slice(0, questCount);
  };
  
  const handleQuestToggle = async (questId: string) => {
    if (!userId) return;
    
    setRefreshing(true);
    
    try {
      // Update local state first (optimistic update)
      setQuests(quests.map(quest => 
        quest.id === questId ? { ...quest, completed: !quest.completed } : quest
      ));
      
      // In a real app, update in database:
      /*
      const quest = quests.find(q => q.id === questId);
      const newStatus = !quest?.completed;
      
      const { error } = await supabase
        .from('daily_quests')
        .update({ completed: newStatus })
        .eq('id', questId);
      
      if (error) throw error;
      
      // If quest was completed, award points to user
      if (newStatus) {
        const questPoints = quest?.points || 0;
        
        // Assume we have a user_points table
        const { data: userPoints, error: pointsError } = await supabase
          .from('user_points')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (pointsError) throw pointsError;
        
        if (userPoints) {
          // Update existing points
          await supabase
            .from('user_points')
            .update({ 
              total_points: userPoints.total_points + questPoints,
              last_updated: new Date().toISOString()
            })
            .eq('user_id', userId);
        } else {
          // Create new points record
          await supabase
            .from('user_points')
            .insert({
              user_id: userId,
              total_points: questPoints,
              level: 1,
              progress_to_next_level: questPoints,
              last_updated: new Date().toISOString()
            });
        }
        
        // Show notification
        toast({
          title: "Quest Completed!",
          description: `You earned ${questPoints} points`,
        });
      }
      */
      
      // For this mock version, wait a little bit
      setTimeout(() => {
        const quest = quests.find(q => q.id === questId);
        if (quest && !quest.completed) {
          toast({
            title: "Quest Completed!",
            description: `You earned ${quest.points} points`,
          });
        }
        setRefreshing(false);
      }, 500);
    } catch (error) {
      console.error('Error toggling quest status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update quest status',
        variant: 'destructive'
      });
      
      // Revert the local state change
      setQuests(quests.map(quest => 
        quest.id === questId ? { ...quest, completed: !quest.completed } : quest
      ));
      
      setRefreshing(false);
    }
  };
  
  const handleRefreshQuests = () => {
    setRefreshing(true);
    // In a real app, we would check if the user has used their daily refresh
    // and then generate new quests if they haven't
    
    setTimeout(() => {
      toast({
        title: 'New Quests',
        description: 'Daily quests have been refreshed',
      });
      loadQuests();
      setRefreshing(false);
    }, 1000);
  };
  
  const calculateCompletionPercentage = () => {
    if (quests.length === 0) return 0;
    const completedQuests = quests.filter(q => q.completed).length;
    return (completedQuests / quests.length) * 100;
  };
  
  const calculateTotalPoints = () => {
    return quests.reduce((total, quest) => {
      return quest.completed ? total + quest.points : total;
    }, 0);
  };
  
  const calculateRemainingPoints = () => {
    return quests.reduce((total, quest) => {
      return !quest.completed ? total + quest.points : total;
    }, 0);
  };
  
  const getTimeLeft = () => {
    if (quests.length === 0) return '24h';
    
    const now = new Date();
    const expiresAt = new Date(quests[0].expires_at);
    const diffMs = expiresAt.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}m`;
  };

  if (!userId) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6 text-center">
          <p className="text-gray-400">Sign in to view daily quests</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400" />
          Daily Quests
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          disabled={refreshing || loading} 
          onClick={handleRefreshQuests}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-300 flex items-center">
            <Clock className="h-4 w-4 mr-1" /> Resets in: <span className="font-medium ml-1">{getTimeLeft()}</span>
          </div>
          <span className="text-sm text-gray-300">
            {Math.round(calculateCompletionPercentage())}% complete
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${calculateCompletionPercentage()}%` }}
            transition={{ duration: 0.5 }}
            className="bg-quantum-cyan h-2 rounded-full" 
          />
        </div>
        
        <div className="space-y-3">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div 
                key={i} 
                className="p-3 rounded-md bg-quantum-darkBlue/40 animate-pulse h-16"
              ></div>
            ))
          ) : quests.length > 0 ? (
            quests.map((quest) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`p-3 rounded-md cursor-pointer 
                  ${quest.completed ? 'bg-quantum-cyan/20' : 'bg-quantum-darkBlue/40'}
                  hover:bg-quantum-darkBlue/70 transition-colors`}
                onClick={() => handleQuestToggle(quest.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {quest.completed ? (
                      <CheckCircle className="h-5 w-5 text-quantum-cyan flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                    <div>
                      <h4 className="font-medium text-sm">{quest.title}</h4>
                      <p className="text-xs text-gray-400">{quest.description}</p>
                    </div>
                  </div>
                  <div className="bg-quantum-black/40 flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold">
                    <Award className="h-3 w-3 text-yellow-400" />
                    {quest.points}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center p-6 text-gray-400">
              <p>No quests available. Check back tomorrow!</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-300">Earned Today:</span>
            <span className="font-bold text-quantum-cyan">{calculateTotalPoints()} pts</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-400">Remaining:</span>
            <span className="text-xs text-gray-400">{calculateRemainingPoints()} pts</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyQuests;
