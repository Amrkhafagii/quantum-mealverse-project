
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertTriangle, Pause, Play, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { SubscriptionsList } from './SubscriptionsList';
import { useCurrency } from '@/hooks/useCurrency';

interface ManageSubscriptionProps {
  userId: string;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_name: string;
  price: number;
  status: 'active' | 'paused' | 'cancelled';
  start_date: string;
  end_date: string | null;
  meals_per_week: number;
  created_at: string;
}

export const ManageSubscription: React.FC<ManageSubscriptionProps> = ({ userId }) => {
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const queryClient = useQueryClient();
  const { formatPrice } = useCurrency();
  
  // Fetch the active subscription for this user
  const { data: activeSubscription, isLoading } = useQuery({
    queryKey: ['active-subscription', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data as Subscription || null;
    },
    enabled: !!userId,
  });
  
  // Mutation to update subscription status
  const updateSubscription = useMutation({
    mutationFn: async ({ subscriptionId, status }: { subscriptionId: string, status: string }) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ status })
        .eq('id', subscriptionId)
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch queries that depend on this data
      queryClient.invalidateQueries({ queryKey: ['active-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    }
  });
  
  const handlePauseSubscription = async (subscription: Subscription) => {
    try {
      await updateSubscription.mutateAsync({ 
        subscriptionId: subscription.id, 
        status: 'paused'
      });
      toast.success('Your subscription has been paused');
    } catch (error) {
      console.error('Error pausing subscription:', error);
      toast.error('Failed to pause your subscription. Please try again.');
    }
  };
  
  const handleResumeSubscription = async (subscription: Subscription) => {
    try {
      await updateSubscription.mutateAsync({ 
        subscriptionId: subscription.id, 
        status: 'active'
      });
      toast.success('Your subscription has been resumed');
    } catch (error) {
      console.error('Error resuming subscription:', error);
      toast.error('Failed to resume your subscription. Please try again.');
    }
  };
  
  const handleCancelSubscription = async () => {
    if (!selectedSubscription) return;
    
    try {
      await updateSubscription.mutateAsync({ 
        subscriptionId: selectedSubscription.id, 
        status: 'cancelled'
      });
      setShowCancelDialog(false);
      toast.success('Your subscription has been cancelled');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel your subscription. Please try again.');
    }
  };
  
  if (isLoading) {
    return <div className="text-center py-4">Loading subscription details...</div>;
  }
  
  if (!activeSubscription) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Subscription</h2>
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>
              You don't currently have an active meal plan subscription.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <a href="/subscription">View Subscription Plans</a>
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Subscription History</h3>
          <SubscriptionsList userId={userId} />
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Current Subscription</h2>
      <Card>
        <CardHeader>
          <CardTitle>{activeSubscription.plan_name}</CardTitle>
          <CardDescription>
            Started on {format(new Date(activeSubscription.start_date), 'MMMM dd, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="font-medium capitalize">{activeSubscription.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Price</span>
              <span className="font-medium">{formatPrice(activeSubscription.price)}/month</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Meals per week</span>
              <span className="font-medium">{activeSubscription.meals_per_week} meals</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Next billing date</span>
              <span className="font-medium">
                {activeSubscription.end_date 
                  ? format(new Date(activeSubscription.end_date), 'MMMM dd, yyyy')
                  : format(new Date(new Date(activeSubscription.start_date).setMonth(new Date(activeSubscription.start_date).getMonth() + 1)), 'MMMM dd, yyyy')}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {activeSubscription.status === 'active' ? (
            <Button 
              variant="outline" 
              onClick={() => handlePauseSubscription(activeSubscription)}
              className="flex items-center gap-2"
            >
              <Pause className="h-4 w-4" />
              Pause Subscription
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => handleResumeSubscription(activeSubscription)}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Resume Subscription
            </Button>
          )}
          
          <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="destructive" 
                onClick={() => setSelectedSubscription(activeSubscription)}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel Subscription
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Cancel Subscription
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to cancel your {activeSubscription.plan_name} subscription? 
                  You will lose access to your meal plan at the end of the current billing period.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                  Keep Subscription
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleCancelSubscription}
                  disabled={updateSubscription.isPending}
                >
                  {updateSubscription.isPending ? 'Cancelling...' : 'Yes, Cancel Subscription'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
      
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Subscription History</h3>
        <SubscriptionsList userId={userId} />
      </div>
    </div>
  );
};
