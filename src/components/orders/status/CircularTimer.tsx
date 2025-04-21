
import React from 'react';
import { useOrderTimer } from '@/hooks/useOrderTimer';

interface CircularTimerProps {
  expires_at: string;
  onExpired: () => void;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({ 
  expires_at, 
  onExpired 
}) => {
  const { progress, formattedTime } = useOrderTimer(
    expires_at,
    undefined, // No orderId needed for this timer
    onExpired
  );

  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="transform -rotate-90 w-28 h-28">
        <circle
          cx="56"
          cy="56"
          r={radius}
          className="stroke-green-500"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
            transition: 'stroke-dashoffset 1s ease-in-out',
          }}
        />
      </svg>
      <div className="absolute font-mono text-2xl font-bold tracking-wider text-white">
        {formattedTime}
      </div>
    </div>
  );
};
