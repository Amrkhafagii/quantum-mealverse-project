
export interface UserStreak {
  id: string;
  user_id: string;
  currentstreak: number;
  longeststreak: number;
  last_activity_date: string;
  streak_type: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  date_achieved: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  points: number;
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
