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
import { AlertTriangle, Calendar, Gift, Pause, Play, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, differenceInDays } from 'date-fns';
import { SubscriptionsList } from './SubscriptionsList';
import { useCurrency } from '@/hooks/useCurrency';
import { Badge } from "@/components/ui/badge";
import { CurrencyDisplay } from '@/components/common/CurrencyDisplay';
import { Subscription } from '@/types/subscription';

interface ManageSubscriptionProps {
  userId: string;
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
      
      return data as Subscription | null;
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

  // Calculate days remaining in trial
  const getTrialDaysRemaining = (trialEndsAt: string | null) => {
    if (!trialEndsAt) return 0;
    return Math.max(0, differenceInDays(new Date(trialEndsAt), new Date()));
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
  
  // Get next billing date
  const getNextBillingDate = () => {
    // If trial, show trial end date
    if (activeSubscription.is_trial && activeSubscription.trial_ends_at) {
      return format(new Date(activeSubscription.trial_ends_at), 'MMMM dd, yyyy');
    }
    
    // Otherwise show regular billing date
    if (activeSubscription.end_date) {
      return format(new Date(activeSubscription.end_date), 'MMMM dd, yyyy');
    }
    
    // Calculate next billing date as 1 month from start date
    const startDate = new Date(activeSubscription.start_date);
    const nextBilling = new Date(startDate);
    nextBilling.setMonth(nextBilling.getMonth() + 1);
    return format(nextBilling, 'MMMM dd, yyyy');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Current Subscription</h2>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{activeSubscription.plan_name}</CardTitle>
              <CardDescription>
                Started on {format(new Date(activeSubscription.start_date), 'MMMM dd, yyyy')}
              </CardDescription>
            </div>
            {activeSubscription.is_trial && (
              <Badge className="bg-quantum-purple text-white">Free Trial</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="font-medium capitalize">{activeSubscription.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Price</span>
              <CurrencyDisplay 
                amount={activeSubscription.price} 
                isTrial={activeSubscription.is_trial} 
              />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Meals per week</span>
              <span className="font-medium">{activeSubscription.meals_per_week} meals</span>
            </div>
            
            {activeSubscription.is_trial && activeSubscription.trial_ends_at && (
              <div className="mt-4 p-3 bg-quantum-darkBlue/20 rounded-lg border border-quantum-purple/30">
                <div className="flex items-center gap-2 text-quantum-purple mb-2">
                  <Gift className="h-4 w-4" />
                  <span className="font-semibold">Free Trial Period</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Trial ends on:</span>
                  <span className="font-medium">{format(new Date(activeSubscription.trial_ends_at), 'MMMM dd, yyyy')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Days remaining:</span>
                  <span className="font-medium">
                    {getTrialDaysRemaining(activeSubscription.trial_ends_at)} days
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex justify-between mt-2">
              <span className="text-gray-500">
                {activeSubscription.is_trial ? 'Trial end date' : 'Next billing date'}
              </span>
              <span className="font-medium flex items-center gap-1">
                <Calendar className="h-4 w-4 inline" />
                {getNextBillingDate()}
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
                  Cancel {activeSubscription.is_trial ? 'Trial' : 'Subscription'}
                </DialogTitle>
                <DialogDescription>
                  {activeSubscription.is_trial 
                    ? `Are you sure you want to cancel your free trial of the ${activeSubscription.plan_name}?`
                    : `Are you sure you want to cancel your ${activeSubscription.plan_name} subscription? You will lose access to your meal plan at the end of the current billing period.`
                  }
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCancelDialog(false)}
                >
                  Keep {activeSubscription.is_trial ? 'Trial' : 'Subscription'}
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleCancelSubscription}
                  disabled={updateSubscription.isPending}
                >
                  {updateSubscription.isPending ? 'Cancelling...' : `Yes, Cancel ${activeSubscription.is_trial ? 'Trial' : 'Subscription'}`}
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
