
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StageTimeline } from './StageTimeline';

interface PreparationStagesCardProps {
  orderId: string;
}

export const PreparationStagesCard: React.FC<PreparationStagesCardProps> = ({ orderId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preparation Stages</CardTitle>
        <CardDescription>
          Track and manage each stage of order preparation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StageTimeline orderId={orderId} />
      </CardContent>
    </Card>
  );
};
