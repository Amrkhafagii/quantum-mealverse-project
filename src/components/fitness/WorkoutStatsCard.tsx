
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface WorkoutStatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: string;
}

export const WorkoutStatsCard: React.FC<WorkoutStatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend
}) => {
  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">{title}</span>
          {icon}
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-xs text-gray-400">{subtitle}</div>
          {trend && (
            <div className="text-xs text-green-500">{trend}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
