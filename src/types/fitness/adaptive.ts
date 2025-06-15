
export interface DifficultyAdjustment {
  id: string;
  suggested_adjustments: string[];
  confidence: number;
  created_at: string;
  applied: boolean;
}

export interface AdaptiveRecommendation {
  type: string;
  adjustments: DifficultyAdjustment[];
  confidence: number;
  reason: string;
}
