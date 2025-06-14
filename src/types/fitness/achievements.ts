
export interface UserStreak {
  id: string;
  user_streaks_user_id: string; // Updated to match new naming convention
  currentstreak: number;
  longeststreak: number;
  last_activity_date: string;
  streak_type: string;
}

export interface UserAchievement {
  id: string;
  user_achievements_user_id: string; // Updated to match new naming convention
  achievement_id: string;
  unlocked_at: string;
  date_achieved?: string;
  progress?: number;
  user_id?: string; // For backward compatibility
  date_earned?: string; // For backward compatibility
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  points: number;
}

export interface ExtendedUserAchievement extends UserAchievement {
  achievement: Achievement;
  date_achieved?: string;
}

export interface StreakReward {
  id: string;
  days_required: number;
  streak_days?: number;
  days?: number;
  streak_length?: number;
  reward_name: string;
  title?: string;
  reward_description: string;
  reward_value: number | string;
  reward_type?: string;
  reward_image?: string;
  icon?: string;
  points?: number;
  is_claimed?: boolean;
}

export interface StreakRewardsProps {
  currentStreak: number;
  rewards: StreakReward[];
  userId?: string;
  longestStreak?: number;
  onClaimReward?: (rewardId: string) => void;
}
