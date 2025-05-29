
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Package, DollarSign } from 'lucide-react';
import type { DeliveryAssignment } from '@/types/delivery-assignment';
import { format } from 'date-fns';

interface AutomaticAssignmentCardProps {
  assignment: DeliveryAssignment;
  onAccept: () => void;
  onReject: () => void;
  isProcessing: boolean;
}

export const AutomaticAssignmentCard: React.FC<AutomaticAssignmentCardProps> = ({
  assignment,
  onAccept,
  onReject,
  isProcessing
}) => {
  const estimatedTime = assignment.estimate_minutes || 30;
  const distance = assignment.distance_km || 0;

  return (
    <Card className="border border-quantum-cyan/20 bg-transparent">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg text-quantum-cyan">New Delivery Assignment</CardTitle>
          <Badge variant="outline" className="text-orange-400 border-orange-400">
            Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Restaurant Info */}
        {assignment.restaurant && (
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-quantum-cyan" />
            <div>
              <p className="font-medium">{assignment.restaurant.name}</p>
              <p className="text-sm text-gray-400">{assignment.restaurant.address}</p>
            </div>
          </div>
        )}

        {/* Customer Info */}
        {assignment.customer && (
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-green-400" />
            <div>
              <p className="font-medium">{assignment.customer.name}</p>
              <p className="text-sm text-gray-400">{assignment.customer.address}</p>
            </div>
          </div>
        )}

        {/* Delivery Details */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-blue-400" />
            <div>
              <p className="text-xs text-gray-400">Est. Time</p>
              <p className="font-medium">{estimatedTime} min</p>
            </div>
          </div>
          
          {distance > 0 && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-purple-400" />
              <div>
                <p className="text-xs text-gray-400">Distance</p>
                <p className="font-medium">{distance.toFixed(1)} km</p>
              </div>
            </div>
          )}
        </div>

        {/* Assignment Time */}
        <div className="text-xs text-gray-400">
          Assigned: {format(new Date(assignment.created_at), 'MMM dd, yyyy HH:mm')}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button
            onClick={onAccept}
            disabled={isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Accept Assignment
          </Button>
          <Button
            onClick={onReject}
            disabled={isProcessing}
            variant="outline"
            className="flex-1 border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
          >
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
