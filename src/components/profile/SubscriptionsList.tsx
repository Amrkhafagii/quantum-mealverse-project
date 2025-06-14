
import React from 'react';
// Remove explicit type for useQuery to avoid the "excessive" error
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { Subscription } from '@/types/subscription';

interface SubscriptionsListProps {
  userId: string;
}

export const SubscriptionsList: React.FC<SubscriptionsListProps> = ({ userId }) => {
  const navigate = useNavigate();

  // Don't use generics here, let it be 'any'
  const { data: subscriptions, isLoading, error } = useQuery({
    queryKey: ['subscriptions', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      // Normalize: always ensure user_id is present, possibly remapping from subscriptions_user_id
      return (data as any[] || []).map((rec) => ({
        ...rec,
        user_id: rec.user_id || rec.subscriptions_user_id,
      })) as Subscription[];
    },
    enabled: !!userId,
  }) as { data: Subscription[] | undefined, isLoading: boolean, error: unknown };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 hover:bg-green-600';
      case 'paused': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'cancelled': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading your subscriptions...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error loading subscriptions</div>;
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="mb-4">You don't have any active subscriptions.</p>
        <Button onClick={() => navigate('/subscription')}>View Subscription Plans</Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Renewal</TableHead>
            <TableHead>Meals/Week</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Type</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => (
            <TableRow key={subscription.id}>
              <TableCell className="font-medium">
                {subscription.plan_name}
              </TableCell>
              <TableCell>
                {format(new Date(subscription.start_date), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>
                {subscription.is_trial && subscription.trial_ends_at
                  ? format(new Date(subscription.trial_ends_at), 'MMM dd, yyyy') + ' (Trial End)'
                  : subscription.end_date
                    ? format(new Date(subscription.end_date), 'MMM dd, yyyy')
                    : 'Auto-renewal'}
              </TableCell>
              <TableCell>{subscription.meals_per_week}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(subscription.status)}>
                  {subscription.status}
                </Badge>
              </TableCell>
              <TableCell>
                <CurrencyDisplay
                  amount={subscription.price}
                  isTrial={subscription.is_trial}
                />
              </TableCell>
              <TableCell>
                {subscription.is_trial ? (
                  <Badge className="bg-quantum-purple">Trial</Badge>
                ) : (
                  <Badge className="bg-gray-500">Paid</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
