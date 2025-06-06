
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Clock, CheckCircle, AlertCircle, Play, Pause, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { recordOrderHistory } from '@/services/orders/webhook/orderHistoryService';

interface PreparationStage {
  id: string;
  name: string;
  description?: string;
  estimated_duration_minutes: number;
  order_index: number;
  status: 'pending' | 'in_progress' | 'completed';
  started_at?: string;
  completed_at?: string;
}

interface OrderPreparationProps {
  orderId: string;
  restaurantId: string;
  onStatusUpdate?: (newStatus: string) => void;
}

export const OrderPreparation: React.FC<OrderPreparationProps> = ({
  orderId,
  restaurantId,
  onStatusUpdate
}) => {
  const [stages, setStages] = useState<PreparationStage[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadPreparationStages();
  }, [orderId]);

  const loadPreparationStages = async () => {
    try {
      const { data, error } = await supabase
        .from('order_preparation_stages')
        .select('*')
        .eq('order_id', orderId)
        .order('stage_order');

      if (error) throw error;

      // Map database fields to component interface
      const mappedStages: PreparationStage[] = (data || []).map(stage => ({
        id: stage.id,
        name: stage.stage_name,
        description: stage.notes,
        estimated_duration_minutes: stage.estimated_duration_minutes,
        order_index: stage.stage_order,
        status: stage.status as 'pending' | 'in_progress' | 'completed',
        started_at: stage.started_at,
        completed_at: stage.completed_at
      }));

      setStages(mappedStages);
    } catch (error) {
      console.error('Error loading preparation stages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load preparation stages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStageStatus = async (stageId: string, status: 'in_progress' | 'completed') => {
    setUpdating(true);
    try {
      const updateData: any = { status };
      
      if (status === 'in_progress') {
        updateData.started_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('order_preparation_stages')
        .update(updateData)
        .eq('id', stageId);

      if (error) throw error;

      await loadPreparationStages();

      // Check if all stages are completed
      const updatedStages = stages.map(stage => 
        stage.id === stageId ? { ...stage, status } : stage
      );
      
      const allCompleted = updatedStages.every(stage => stage.status === 'completed');
      
      if (allCompleted) {
        await recordOrderHistory(
          orderId,
          'ready_for_pickup',
          restaurantId,
          { notes: 'All preparation stages completed' }
        );
        
        onStatusUpdate?.('ready_for_pickup');
        
        toast({
          title: 'Order Ready',
          description: 'All preparation stages completed. Order is ready for pickup.',
        });
      }

    } catch (error) {
      console.error('Error updating stage:', error);
      toast({
        title: 'Error',
        description: 'Failed to update preparation stage',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const resetStage = async (stageId: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('order_preparation_stages')
        .update({
          status: 'pending',
          started_at: null,
          completed_at: null
        })
        .eq('id', stageId);

      if (error) throw error;
      await loadPreparationStages();

      toast({
        title: 'Stage Reset',
        description: 'Preparation stage has been reset',
      });
    } catch (error) {
      console.error('Error resetting stage:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset preparation stage',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
        <CardContent className="pt-6">
          <div className="text-center">Loading preparation stages...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-quantum-darkBlue/30 border-quantum-cyan/20">
      <CardHeader>
        <CardTitle className="text-quantum-cyan">Order Preparation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stages.length === 0 ? (
          <div className="text-center text-gray-400">
            No preparation stages defined for this order
          </div>
        ) : (
          <>
            {stages.map((stage, index) => (
              <div key={stage.id} className="space-y-2">
                <div className={`p-4 rounded-lg border ${getStatusColor(stage.status)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStageIcon(stage.status)}
                      <span className="font-medium">{stage.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {stage.estimated_duration_minutes}min
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      {stage.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => updateStageStatus(stage.id, 'in_progress')}
                          disabled={updating}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                      {stage.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => updateStageStatus(stage.id, 'completed')}
                          disabled={updating}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                      {stage.status !== 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resetStage(stage.id)}
                          disabled={updating}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Reset
                        </Button>
                      )}
                    </div>
                  </div>
                  {stage.description && (
                    <p className="text-sm text-gray-300">{stage.description}</p>
                  )}
                  {stage.started_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      Started: {new Date(stage.started_at).toLocaleTimeString()}
                    </p>
                  )}
                  {stage.completed_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      Completed: {new Date(stage.completed_at).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t border-gray-600">
              <Textarea
                placeholder="Add preparation notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mb-3"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
