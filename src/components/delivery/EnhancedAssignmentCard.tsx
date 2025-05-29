
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Star, Timer, User, AlertCircle } from 'lucide-react';
import { DeliveryAssignment } from '@/types/delivery-assignment';
import { restaurantDeliveryHandoffService } from '@/services/delivery/restaurantDeliveryHandoffService';
import { toast } from '@/hooks/use-toast';

interface EnhancedAssignmentCardProps {
  assignment: DeliveryAssignment & {
    priority_score?: number;
    expires_at?: string;
    auto_assigned?: boolean;
    assignment_attempt?: number;
  };
  onResponse?: () => void;
  showActions?: boolean;
}

export const EnhancedAssignmentCard: React.FC<EnhancedAssignmentCardProps> = ({
  assignment,
  onResponse,
  showActions = true
}) => {
  const [responding, setResponding] = useState(false);

  const handleResponse = async (action: 'accept' | 'reject', reason?: string) => {
    if (!assignment.delivery_user_id) return;

    try {
      setResponding(true);
      const success = await restaurantDeliveryHandoffService.handleAssignmentResponse(
        assignment.id,
        assignment.delivery_user_id,
        action,
        reason
      );

      if (success) {
        toast({
          title: action === 'accept' ? 'Assignment Accepted' : 'Assignment Rejected',
          description: action === 'accept' 
            ? 'You have accepted this delivery assignment'
            : 'Assignment has been rejected and will be reassigned'
        });
        onResponse?.();
      } else {
        throw new Error('Failed to process response');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process assignment response',
        variant: 'destructive'
      });
    } finally {
      setResponding(false);
    }
  };

  const getTimeRemaining = () => {
    if (!assignment.expires_at) return null;
    
    const now = new Date();
    const expires = new Date(assignment.expires_at);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-blue-100 text-blue-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const timeRemaining = getTimeRemaining();
  const isExpired = timeRemaining === 'Expired';

  return (
    <Card className={`${isExpired ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Delivery Assignment
            {assignment.auto_assigned && (
              <Badge variant="outline" className="ml-2 text-xs">
                Auto-assigned
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {assignment.priority_score && (
              <Badge className={getPriorityColor(assignment.priority_score)}>
                Priority: {assignment.priority_score}
              </Badge>
            )}
            {assignment.assignment_attempt && assignment.assignment_attempt > 1 && (
              <Badge variant="secondary">
                Attempt #{assignment.assignment_attempt}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Remaining */}
        {timeRemaining && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            isExpired ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
          }`}>
            <Timer className="h-4 w-4" />
            <span className="font-medium">
              {isExpired ? 'Assignment Expired' : `Time remaining: ${timeRemaining}`}
            </span>
            {isExpired && <AlertCircle className="h-4 w-4" />}
          </div>
        )}

        {/* Restaurant Information */}
        {assignment.restaurant && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Pickup Location
            </h4>
            <div className="bg-white p-3 rounded border">
              <p className="font-medium">{assignment.restaurant.name}</p>
              <p className="text-sm text-gray-600">{assignment.restaurant.address}</p>
              {assignment.distance_km && (
                <p className="text-sm text-blue-600">
                  Distance: {assignment.distance_km.toFixed(1)} km
                </p>
              )}
            </div>
          </div>
        )}

        {/* Customer Information */}
        {assignment.customer && (
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Delivery Location
            </h4>
            <div className="bg-white p-3 rounded border">
              <p className="font-medium">{assignment.customer.name}</p>
              <p className="text-sm text-gray-600">{assignment.customer.address}</p>
            </div>
          </div>
        )}

        {/* Estimated Delivery Time */}
        {assignment.estimate_minutes && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Estimated delivery time: {assignment.estimate_minutes} minutes</span>
          </div>
        )}

        {/* Assignment Actions */}
        {showActions && assignment.status === 'assigned' && !isExpired && (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={() => handleResponse('accept')}
              disabled={responding}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Accept Assignment
            </Button>
            <Button
              onClick={() => handleResponse('reject', 'Driver unavailable')}
              disabled={responding}
              variant="outline"
              className="flex-1"
            >
              Decline
            </Button>
          </div>
        )}

        {isExpired && (
          <div className="bg-red-100 border border-red-200 rounded-lg p-3 text-center">
            <p className="text-red-800 font-medium">
              This assignment has expired and may be reassigned
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
