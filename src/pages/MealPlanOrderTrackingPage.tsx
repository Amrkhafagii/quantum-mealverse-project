
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MealPlanOrderTracking } from '@/components/nutrition/MealPlanOrderTracking';
import { useAuth } from '@/hooks/useAuth';

export default function MealPlanOrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!orderId) {
      navigate('/nutrition');
      return;
    }
  }, [user, orderId, navigate]);

  if (!orderId) {
    return null;
  }

  return <MealPlanOrderTracking orderId={orderId} />;
}
