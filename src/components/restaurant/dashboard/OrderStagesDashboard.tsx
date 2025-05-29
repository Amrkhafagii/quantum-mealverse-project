
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useDashboardStages } from '@/hooks/dashboard/useDashboardStages';
import { Clock, CheckCircle, Package, AlertCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import ErrorBoundary from '@/components/ErrorBoundary';

interface OrderStagesDashboardProps {
  restaurantId: string;
}

export const OrderStagesDashboard: React.FC<OrderStagesDashboardProps> = ({ restaurantId }) => {
  console.log('OrderStagesDashboard - Component mounted with restaurantId:', restaurantId);

  const {
    orders,
    isLoading,
    advanceStage,
    updateStageNotes,
    refetch
  } = useDashboardStages(restaurantId);

  console.log('OrderStagesDashboard - Data:', { orders, isLoading });

  const handleAdvanceStage = async (orderId: string, stageName: string) => {
    console.log('OrderStagesDashboard - Advancing stage:', { orderId, stageName });
    try {
      await advanceStage(orderId, stageName);
    } catch (error) {
      console.error('OrderStagesDashboard - Error advancing stage:', error);
    }
  };

  const getStageColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-gray-400';
      default: return 'bg-gray-300';
    }
  };

  const formatStageName = (name: string) => {
    return name.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    console.log('OrderStagesDashboard - Showing loading state');
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quantum-cyan mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order stages...</p>
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    console.log('OrderStagesDashboard - No orders found');
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order Stages</CardTitle>
            <Button onClick={refetch} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Active Orders</h3>
          <p className="text-gray-600">Orders with preparation stages will appear here.</p>
        </CardContent>
      </Card>
    );
  }

  console.log('OrderStagesDashboard - Rendering orders:', orders.length);

  return (
    <ErrorBoundary fallback={
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Component Error</h3>
          <p className="text-red-600">There was an error loading the order stages.</p>
        </CardContent>
      </Card>
    }>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Order Preparation Stages</h2>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order.order_id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{order.order_id.substring(0, 8)}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {order.customer_name} • EGP {order.total}
                    </p>
                  </div>
                  <div className="text-right">
                    <Progress value={order.overall_progress} className="w-24 mb-1" />
                    <p className="text-sm text-gray-600">{order.overall_progress}% Complete</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {order.stages && order.stages.length > 0 ? (
                    order.stages.map((stage, index) => (
                      <div key={stage.stage_id} className="relative">
                        {index < order.stages.length - 1 && (
                          <div className="absolute left-4 top-8 w-0.5 h-16 bg-gray-200"></div>
                        )}
                        
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStageColor(stage.stage_status)}`}>
                            {stage.stage_status === 'completed' ? (
                              <CheckCircle className="h-5 w-5 text-white" />
                            ) : stage.stage_status === 'in_progress' ? (
                              <Clock className="h-5 w-5 text-white" />
                            ) : (
                              <div className="w-3 h-3 bg-white rounded-full"></div>
                            )}
                          </div>
                          
                          <div className="flex-grow">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{formatStageName(stage.stage_name)}</h4>
                                <p className="text-sm text-gray-600">
                                  Estimated: {stage.estimated_duration_minutes} min
                                  {stage.actual_duration_minutes && (
                                    <span> • Actual: {stage.actual_duration_minutes} min</span>
                                  )}
                                </p>
                                {stage.stage_started_at && (
                                  <p className="text-xs text-gray-500">
                                    Started: {format(new Date(stage.stage_started_at), 'HH:mm')}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Badge className={`${getStageColor(stage.stage_status)} text-white`}>
                                  {stage.stage_status.replace('_', ' ')}
                                </Badge>
                                
                                {stage.stage_status === 'in_progress' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleAdvanceStage(order.order_id, stage.stage_name)}
                                  >
                                    Complete
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            {stage.stage_notes && (
                              <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                                {stage.stage_notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-gray-600">No preparation stages found for this order</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
};
