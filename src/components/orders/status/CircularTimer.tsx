
import React from 'react';

interface CircularTimerProps {
  timeLeft: number;
  totalTime: number;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({ timeLeft, totalTime }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeLeft / totalTime) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="transform -rotate-90 w-28 h-28">
        {/* Progress circle */}
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
      <div className="absolute font-mono text-2xl font-bold tracking-wider">
        {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
      </div>
    </div>
  );
};
