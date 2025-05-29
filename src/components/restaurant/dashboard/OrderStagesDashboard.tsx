
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  PlayCircle, 
  CheckCircle, 
  StickyNote, 
  User, 
  Phone, 
  MapPin,
  ChefHat
} from 'lucide-react';
import { useDashboardStages } from '@/hooks/dashboard/useDashboardStages';
import { StageNotesModal } from '@/components/restaurant/orders/preparation/StageNotesModal';
import { formatDistanceToNow } from 'date-fns';
import { GroupedOrder } from '@/services/dashboard/dashboardStageService';

interface OrderStagesDashboardProps {
  restaurantId: string;
}

export const OrderStagesDashboard: React.FC<OrderStagesDashboardProps> = ({ 
  restaurantId 
}) => {
  const { orders, isLoading, advanceStage, updateStageNotes } = useDashboardStages(restaurantId);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState<{ orderId: string; stageName: string }>({ orderId: '', stageName: '' });

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <PlayCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStageColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const formatStageName = (stageName: string) => {
    return stageName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleAdvanceStage = async (orderId: string, stageName: string) => {
    await advanceStage(orderId, stageName);
  };

  const handleAddNotes = (orderId: string, stageName: string) => {
    setSelectedStage({ orderId, stageName });
    setNotesModalOpen(true);
  };

  const handleSaveNotes = async (notes: string) => {
    if (selectedStage.orderId && selectedStage.stageName) {
      await updateStageNotes(selectedStage.orderId, selectedStage.stageName, notes);
    }
  };

  const getCurrentStage = (order: GroupedOrder) => {
    return order.stages.find(stage => stage.stage_status === 'in_progress');
  };

  const getNextPendingStage = (order: GroupedOrder) => {
    return order.stages.find(stage => stage.stage_status === 'pending');
  };

  const getOrderAge = (createdAt: string) => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading orders...</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <ChefHat className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Active Orders</h3>
          <p className="text-gray-600">All orders are completed or no orders are currently being prepared.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Active Orders ({orders.length})</h2>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Real-time Updates
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {orders.map((order) => {
          const currentStage = getCurrentStage(order);
          const nextStage = getNextPendingStage(order);

          return (
            <Card key={order.order_id} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Order #{order.order_id.slice(0, 8)}
                  </CardTitle>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-600">
                      {order.overall_progress}%
                    </div>
                    <div className="text-sm text-gray-500">Complete</div>
                  </div>
                </div>
                
                <Progress value={order.overall_progress} className="h-2" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3 text-gray-500" />
                      <span className="font-medium">{order.customer_name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3 text-gray-500" />
                      <span className="text-gray-600">{order.customer_phone}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-gray-500" />
                      <span className="text-gray-600 text-xs">{order.delivery_address}</span>
                    </div>
                    <div className="text-gray-500">
                      ${order.total.toFixed(2)} • {getOrderAge(order.created_at)}
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {order.stages.map((stage) => (
                    <div 
                      key={stage.stage_id} 
                      className={`flex items-center justify-between p-3 rounded-lg border ${getStageColor(stage.stage_status)}`}
                    >
                      <div className="flex items-center space-x-3">
                        {getStageIcon(stage.stage_status)}
                        <div>
                          <div className="font-medium">{formatStageName(stage.stage_name)}</div>
                          <div className="text-sm">
                            Est: {stage.estimated_duration_minutes}m
                            {stage.actual_duration_minutes && (
                              <span className="ml-2 text-green-600">
                                (Completed in {stage.actual_duration_minutes}m)
                              </span>
                            )}
                          </div>
                          {stage.stage_notes && (
                            <div className="text-xs text-gray-600 mt-1 flex items-center space-x-1">
                              <StickyNote className="h-3 w-3" />
                              <span>{stage.stage_notes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {stage.stage_status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={() => handleAdvanceStage(order.order_id, stage.stage_name)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Button>
                        )}
                        
                        {stage.stage_status === 'pending' && 
                         stage.stage_order === order.stages.find(s => s.stage_status !== 'completed')?.stage_order && (
                          <Button
                            size="sm"
                            onClick={() => handleAdvanceStage(order.order_id, stage.stage_name)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <PlayCircle className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddNotes(order.order_id, stage.stage_name)}
                        >
                          <StickyNote className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {currentStage && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm font-medium text-blue-900">
                      Currently: {formatStageName(currentStage.stage_name)}
                    </div>
                    {currentStage.stage_started_at && (
                      <div className="text-xs text-blue-700 mt-1">
                        Started {formatDistanceToNow(new Date(currentStage.stage_started_at), { addSuffix: true })}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <StageNotesModal
        isOpen={notesModalOpen}
        onClose={() => setNotesModalOpen(false)}
        onSave={handleSaveNotes}
        stageName={selectedStage.stageName}
      />
    </div>
  );
};
