
import { fromTable, supabase } from './supabaseClient';
import { FitnessGoal, UserMeasurement } from '@/types/fitness';
import { createNotification } from '@/components/ui/fitness-notification';
import { format } from 'date-fns';

/**
 * Evaluates progress toward a fitness goal
 */
export const evaluateGoalProgress = async (goalId: string): Promise<{ 
  progress: number;
  message: string;
  isAchieved: boolean; 
}> => {
  try {
    // Get the goal details
    const { data: goal, error: goalError } = await fromTable('fitness_goals')
      .select('*')
      .eq('id', goalId)
      .single();
    
    if (goalError) throw goalError;
    
    // Get the latest measurement for the user
    const { data: latestMeasurement, error: measurementError } = await fromTable('user_measurements')
      .select('*')
      .eq('user_id', goal.user_id)
      .order('date', { ascending: false })
      .limit(1)
      .single();
      
    if (measurementError && measurementError.code !== 'PGRST116') {
      throw measurementError;
    }
    
    // If no measurements, return 0 progress
    if (!latestMeasurement) {
      return { 
        progress: 0, 
        message: "No measurements recorded yet", 
        isAchieved: false 
      };
    }

    // Calculate progress based on goal type
    if (goal.target_weight && latestMeasurement.weight) {
      const startingGoalData = await getGoalStartingData(goal as FitnessGoal);
      const startingWeight = startingGoalData?.weight || latestMeasurement.weight;
      
      // Calculate if this is a weight loss or gain goal
      const isWeightLoss = goal.target_weight < startingWeight;
      
      if (isWeightLoss) {
        // For weight loss goals
        const totalToLose = startingWeight - goal.target_weight;
        const lostSoFar = startingWeight - latestMeasurement.weight;
        const progress = Math.min(100, Math.max(0, (lostSoFar / totalToLose) * 100));
        const remaining = latestMeasurement.weight - goal.target_weight;
        
        const isAchieved = latestMeasurement.weight <= goal.target_weight;
        const message = isAchieved 
          ? `Goal achieved! You've reached your target weight of ${goal.target_weight}kg.`
          : `${remaining.toFixed(1)}kg to go to reach your target of ${goal.target_weight}kg`;
          
        return { progress, message, isAchieved };
      } else {
        // For weight gain goals
        const totalToGain = goal.target_weight - startingWeight;
        const gainedSoFar = latestMeasurement.weight - startingWeight;
        const progress = Math.min(100, Math.max(0, (gainedSoFar / totalToGain) * 100));
        const remaining = goal.target_weight - latestMeasurement.weight;
        
        const isAchieved = latestMeasurement.weight >= goal.target_weight;
        const message = isAchieved 
          ? `Goal achieved! You've reached your target weight of ${goal.target_weight}kg.`
          : `${remaining.toFixed(1)}kg to go to reach your target of ${goal.target_weight}kg`;
          
        return { progress, message, isAchieved };
      }
    }
    
    // For body fat goals
    else if (goal.target_body_fat !== null && latestMeasurement.body_fat !== null) {
      const startingGoalData = await getGoalStartingData(goal as FitnessGoal);
      const startingBodyFat = startingGoalData?.body_fat || latestMeasurement.body_fat;
      
      // Assuming body fat goals are always reduction goals
      const totalToReduce = startingBodyFat - goal.target_body_fat;
      const reducedSoFar = startingBodyFat - latestMeasurement.body_fat;
      const progress = Math.min(100, Math.max(0, (reducedSoFar / totalToReduce) * 100));
      const remaining = latestMeasurement.body_fat - goal.target_body_fat;
      
      const isAchieved = latestMeasurement.body_fat <= goal.target_body_fat;
      const message = isAchieved 
        ? `Goal achieved! You've reached your target body fat of ${goal.target_body_fat}%.`
        : `${remaining.toFixed(1)}% to go to reach your target of ${goal.target_body_fat}%`;
        
      return { progress, message, isAchieved };
    }
    
    // If we can't calculate specific progress
    return { 
      progress: 0, 
      message: "Unable to calculate progress", 
      isAchieved: false 
    };
  } catch (error) {
    console.error('Error evaluating goal progress:', error);
    return { 
      progress: 0, 
      message: "Error calculating progress", 
      isAchieved: false 
    };
  }
};

/**
 * Get the starting measurements when the goal was created
 */
const getGoalStartingData = async (goal: FitnessGoal): Promise<UserMeasurement | null> => {
  try {
    // Find measurements taken around the time the goal was created
    const { data, error } = await fromTable('user_measurements')
      .select('*')
      .eq('user_id', goal.user_id)
      .lte('date', goal.created_at)
      .order('date', { ascending: false })
      .limit(1);
      
    if (error) throw error;
    
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error getting goal starting data:', error);
    return null;
  }
};

/**
 * Updates goal status if achieved or abandoned
 */
export const updateGoalStatusBasedOnProgress = async (userId: string, goalId?: string): Promise<void> => {
  try {
    // Get all active goals or a specific goal
    const query = fromTable('fitness_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');
      
    if (goalId) {
      query.eq('id', goalId);
    }
    
    const { data: goals, error } = await query;
    
    if (error) throw error;
    
    if (!goals || goals.length === 0) return;
    
    // Check each goal's progress
    for (const goal of goals) {
      // Need to type cast the goal status to ensure it matches the expected type
      const typedGoal = {
        ...goal,
        status: goal.status as "active" | "completed" | "abandoned"
      };
      
      const { progress, isAchieved } = await evaluateGoalProgress(typedGoal.id);
      
      // Update completed goals
      if (isAchieved && typedGoal.status !== 'completed') {
        await fromTable('fitness_goals')
          .update({ 
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', typedGoal.id);
          
        // Create notification for the achievement
        await createNotification(
          userId,
          'Goal Achieved!', 
          `You've reached your goal: ${typedGoal.name}!`,
          'goal'
        );
      }
      
      // Check if target date has passed for goals not achieved
      if (typedGoal.target_date && !isAchieved) {
        const targetDate = new Date(typedGoal.target_date);
        const now = new Date();
        
        if (targetDate < now && typedGoal.status !== 'abandoned') {
          await fromTable('fitness_goals')
            .update({ 
              status: 'abandoned',
              updated_at: new Date().toISOString()
            })
            .eq('id', typedGoal.id);
            
          // Create notification for the missed goal
          await createNotification(
            userId,
            'Goal Deadline Passed',
            `Your goal "${typedGoal.name}" has passed its target date. You can update or reset it.`,
            'goal'
          );
        }
      }
    }
  } catch (error) {
    console.error('Error updating goal statuses:', error);
  }
};

/**
 * Checks if a user deserves a streak achievement based on consistency
 */
export const checkWorkoutStreak = async (userId: string): Promise<void> => {
  try {
    // Get user streak information
    const { data: streakData, error: streakError } = await fromTable('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('streak_type', 'workout')
      .single();
      
    if (streakError && streakError.code !== 'PGRST116') {
      throw streakError;
    }
    
    // If no streak record exists, create one
    if (!streakData) {
      await fromTable('user_streaks')
        .insert({
          user_id: userId,
          streak_type: 'workout',
          currentstreak: 1,
          longeststreak: 1,
          last_activity_date: new Date().toISOString()
        });
      return;
    }
    
    // Get today and streak's last activity date
    const today = new Date().setHours(0, 0, 0, 0);
    const lastActivity = new Date(streakData.last_activity_date).setHours(0, 0, 0, 0);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    // Skip if already logged a workout today
    if (today === lastActivity) {
      return;
    }
    
    // If worked out yesterday, increment streak
    if (lastActivity === yesterday.getTime()) {
      const newCurrentStreak = streakData.currentstreak + 1;
      const newLongestStreak = Math.max(newCurrentStreak, streakData.longeststreak);
      
      await fromTable('user_streaks')
        .update({ 
          currentstreak: newCurrentStreak,
          longeststreak: newLongestStreak,
          last_activity_date: new Date().toISOString()
        })
        .eq('id', streakData.id);
      
      // Check for streak achievements
      if (newCurrentStreak === 7) {
        await createNotification(
          userId,
          '7-Day Streak!',
          "You've worked out for 7 days in a row! Keep up the momentum!",
          'streak'
        );
      } else if (newCurrentStreak === 30) {
        await createNotification(
          userId,
          '30-Day Streak!',
          "Amazing! You've worked out for 30 consecutive days! That's dedication!",
          'streak'
        );
      } else if (newLongestStreak > streakData.longeststreak) {
        await createNotification(
          userId,
          'New Streak Record!',
          `Congratulations! You've set a new personal record with a ${newLongestStreak}-day workout streak!`,
          'streak'
        );
      }
    } 
    // If missed a day, reset streak to 1
    else {
      await fromTable('user_streaks')
        .update({ 
          currentstreak: 1,
          last_activity_date: new Date().toISOString()
        })
        .eq('id', streakData.id);
    }
  } catch (error) {
    console.error('Error checking workout streak:', error);
  }
};

/**
 * Generates progress insights based on user's measurement history
 */
export const generateProgressInsights = async (userId: string): Promise<{
  insights: string[];
  trends: {
    weight: 'improving' | 'declining' | 'maintaining' | 'insufficient_data';
    bodyFat: 'improving' | 'declining' | 'maintaining' | 'insufficient_data';
  }
}> => {
  try {
    const insights: string[] = [];
    
    // Get user's measurements, ordered by date
    const { data: measurements, error } = await fromTable('user_measurements')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });
      
    if (error) throw error;
    
    if (!measurements || measurements.length < 2) {
      return { 
        insights: ['Add more measurements to see insights about your progress.'], 
        trends: {
          weight: 'insufficient_data',
          bodyFat: 'insufficient_data'
        }
      };
    }
    
    // Get the first and latest measurements
    const firstMeasurement = measurements[0];
    const latestMeasurement = measurements[measurements.length - 1];
    
    // Calculate changes between first and latest measurements
    const weightChange = latestMeasurement.weight - firstMeasurement.weight;
    
    // Weight change insights
    let weightTrend: 'improving' | 'declining' | 'maintaining' | 'insufficient_data' = 'maintaining';
    
    if (Math.abs(weightChange) < 0.5) {
      insights.push("Your weight has remained stable since you started tracking.");
      weightTrend = 'maintaining';
    } else if (weightChange < 0) {
      insights.push(`You've lost ${Math.abs(weightChange).toFixed(1)}kg since you started tracking.`);
      weightTrend = 'improving';
    } else {
      insights.push(`You've gained ${weightChange.toFixed(1)}kg since you started tracking.`);
      weightTrend = 'declining';
    }
    
    // Body fat insights
    let bodyFatTrend: 'improving' | 'declining' | 'maintaining' | 'insufficient_data' = 'insufficient_data';
    
    if (latestMeasurement.body_fat !== null && firstMeasurement.body_fat !== null) {
      const bodyFatChange = latestMeasurement.body_fat - firstMeasurement.body_fat;
      
      if (Math.abs(bodyFatChange) < 0.5) {
        insights.push("Your body fat percentage has remained stable.");
        bodyFatTrend = 'maintaining';
      } else if (bodyFatChange < 0) {
        insights.push(`Your body fat has decreased by ${Math.abs(bodyFatChange).toFixed(1)}% since you started tracking.`);
        bodyFatTrend = 'improving';
      } else {
        insights.push(`Your body fat has increased by ${bodyFatChange.toFixed(1)}% since you started tracking.`);
        bodyFatTrend = 'declining';
      }
    }
    
    // Calculate weekly rate of change for recent measurements (last 4-8 weeks)
    if (measurements.length >= 4) {
      const recentMeasurements = measurements.slice(-8);
      if (recentMeasurements.length >= 2) {
        const firstDate = new Date(recentMeasurements[0].date);
        const lastDate = new Date(recentMeasurements[recentMeasurements.length - 1].date);
        const weeksDiff = Math.max(1, Math.round((lastDate.getTime() - firstDate.getTime()) / (7 * 24 * 60 * 60 * 1000)));
        
        const recentWeightChange = recentMeasurements[recentMeasurements.length - 1].weight - recentMeasurements[0].weight;
        const weeklyWeightChange = recentWeightChange / weeksDiff;
        
        if (Math.abs(weeklyWeightChange) > 0.1) {
          const direction = weeklyWeightChange < 0 ? "losing" : "gaining";
          insights.push(`You are currently ${direction} approximately ${Math.abs(weeklyWeightChange).toFixed(1)}kg per week.`);
        }
      }
    }
    
    // Calculate consistency in logging measurements
    const dateDiffs: number[] = [];
    for (let i = 1; i < measurements.length; i++) {
      const prevDate = new Date(measurements[i - 1].date);
      const currDate = new Date(measurements[i].date);
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000));
      dateDiffs.push(diffDays);
    }
    
    const avgDaysBetweenLogs = dateDiffs.reduce((sum, diff) => sum + diff, 0) / dateDiffs.length;
    
    if (avgDaysBetweenLogs <= 7) {
      insights.push("You're consistently tracking your measurements, which is excellent for monitoring progress.");
    } else if (avgDaysBetweenLogs <= 14) {
      insights.push("Try to log your measurements more frequently for better tracking of your progress.");
    } else {
      insights.push("More frequent measurements would help you track your progress more accurately.");
    }
    
    // Goal progress insight
    const { data: activeGoals } = await fromTable('fitness_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');
      
    if (activeGoals && activeGoals.length > 0) {
      for (const goal of activeGoals) {
        const { progress, message } = await evaluateGoalProgress(goal.id);
        
        if (progress > 0) {
          insights.push(`Goal "${goal.name}": ${progress.toFixed(0)}% complete. ${message}`);
        }
      }
    }
    
    return { 
      insights,
      trends: {
        weight: weightTrend,
        bodyFat: bodyFatTrend
      }
    };
  } catch (error) {
    console.error('Error generating progress insights:', error);
    return { 
      insights: ['Unable to generate insights at this time.'],
      trends: {
        weight: 'insufficient_data',
        bodyFat: 'insufficient_data'
      }
    };
  }
};
