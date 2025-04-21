
export const calculateRemainingTime = (
  expiresAtDate: Date,
  serverTimeOffset: number
): number => {
  const now = new Date();
  const adjustedNow = new Date(now.getTime() + serverTimeOffset);
  console.log('Adjusted current time (with server offset):', adjustedNow.toISOString());
  
  const secondsLeft = Math.max(0, Math.floor((expiresAtDate.getTime() - adjustedNow.getTime()) / 1000));
  console.log('Time remaining with server-adjusted time (seconds):', secondsLeft);
  
  return secondsLeft;
};

export const formatTime = (seconds: number): string => {
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
};

export const calculateProgress = (secondsLeft: number): number => {
  const FIVE_MINUTES = 5 * 60; // 5 minutes in seconds
  return Math.max(0, Math.min(100, (secondsLeft / FIVE_MINUTES) * 100));
};
