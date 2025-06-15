
import { useState, useCallback } from "react";

// In production, integrate with a real API if needed
export function useReviewContentAnalysis() {
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  // You may later integrate with a remote AI service if needed.
  const analyze = useCallback(async (content: string) => {
    setLoading(true);
    // For now, don't use any mock/test/fallbacks (just treat empty or simple content as score 50, else 100, but you can enhance later).
    let contentScore = 100;
    if (!content || content.trim().length < 20) contentScore = 50;
    setScore(contentScore);
    setLoading(false);
    return contentScore;
  }, []);

  return { score, loading, analyze };
}
