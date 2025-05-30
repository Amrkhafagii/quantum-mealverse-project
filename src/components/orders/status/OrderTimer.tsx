import React, { useState, useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { useResponsive } from '@/responsive/core';

interface OrderTimerProps {
  startTime: Date;
  deliveryLocation?: {
    latitude: number;
    longitude: number;
  };
}

const calculateTimeRemaining = (startTime: Date): string => {
  const now = new Date();
  const difference = startTime.getTime() - now.getTime();

  if (difference <= 0) {
    return "Order arriving soon!";
  }

  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const seconds = Math.floor((difference / 1000) % 60);

  return `${minutes}m ${seconds}s`;
};

export const OrderTimer: React.FC<OrderTimerProps> = ({ startTime, deliveryLocation }) => {
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(startTime));
  const { isMobile } = useResponsive();

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(startTime));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [startTime]);

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
      <Clock className="h-4 w-4" />
      <span>{timeRemaining}</span>
      {deliveryLocation && isMobile && (
        <>
          <MapPin className="h-4 w-4" />
          <span>{deliveryLocation.latitude.toFixed(2)}, {deliveryLocation.longitude.toFixed(2)}</span>
        </>
      )}
    </div>
  );
};
