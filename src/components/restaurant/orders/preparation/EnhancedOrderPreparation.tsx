
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, MapPin, Phone, StickyNote } from 'lucide-react';
import { StageTimeline } from './StageTimeline';
import { BulkStageActions } from './BulkStageActions';
import { StageNotesModal } from './StageNotesModal';
import { usePreparationStages } from '@/hooks/usePreparationStages';
import { useOrderContext } from '@/contexts/OrderContext';
import { formatDistanceToNow } from 'date-fns';

export const EnhancedOrderPreparation: React.FC = () => {
  const { order } = useOrderContext();
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>('');
  
  const {
    updateNotes,
    overallProgress
  } = usePreparationStages(order.id!);

  const handleAddNotes = (stageName: string) => {
    setSelectedStage(stageName);
    setNotesModalOpen(true);
  };

  const handleSaveNotes = (notes: string) => {
    if (selectedStage) {
      updateNotes(selectedStage, notes);
    }
  };

  const getOrderAge = () => {
    try {
      return formatDistanceToNow(new Date(order.created_at!), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-blue-500';
      case 'ready_for_pickup': return 'bg-green-500';
      case 'restaurant_accepted': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>Order #{order.formatted_order_id || order.id?.slice(0, 8)}</span>
                <Badge className={getStatusColor(order.status)}>
                  {order.status?.replace('_', ' ')}
                </Badge>
              </CardTitle>
              <CardDescription>
                Received {getOrderAge()} • ${order.total?.toFixed(2)}
              </CardDescription>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {overallProgress || 0}%
              </div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{order.customer_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{order.customer_phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{order.delivery_address}</span>
              </div>
            </div>
            
            {/* Order Items */}
            <div>
              <h4 className="font-medium mb-2">Order Items</h4>
              <div className="space-y-1">
                {order.order_items?.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>${item.price?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              {order.notes && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-center space-x-1 text-yellow-700">
                    <StickyNote className="h-3 w-3" />
                    <span className="text-xs font-medium">Special Instructions:</span>
                  </div>
                  <p className="text-sm text-yellow-800 mt-1">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      <BulkStageActions 
        orderId={order.id!}
        onMarkAllComplete={() => {
          console.log('Bulk action completed');
        }}
        onSkipToReady={() => {
          console.log('Skipped to ready');
        }}
      />

      {/* Stage Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Preparation Stages</CardTitle>
          <CardDescription>
            Track and manage each stage of order preparation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StageTimeline orderId={order.id!} />
        </CardContent>
      </Card>

      {/* Notes Modal */}
      <StageNotesModal
        isOpen={notesModalOpen}
        onClose={() => setNotesModalOpen(false)}
        onSave={handleSaveNotes}
        stageName={selectedStage}
      />
    </div>
  );
};
