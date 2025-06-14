
import { supabase } from '@/integrations/supabase/client';
import { preparationNotificationService } from '@/services/notifications/preparationNotificationService';

interface StageTransition {
  orderId: string;
  fromStage: string;
  toStage: string;
  timestamp: Date;
  estimatedCompletionTime?: Date;
}

interface AutomationRule {
  id: string;
  restaurantId: string;
  fromStage: string;
  toStage: string;
  condition: 'time_based' | 'manual_trigger' | 'external_signal';
  parameters: any;
  isActive: boolean;
}

export const getAutomationRules = async (restaurantId: string): Promise<AutomationRule[]> => {
  try {
    console.log('Fetching automation rules for restaurant:', restaurantId);
    
    // Mock automation rules for now
    return [
      {
        id: 'rule-1',
        restaurantId,
        fromStage: 'order_received',
        toStage: 'preparation_started',
        condition: 'time_based',
        parameters: { delayMinutes: 2 },
        isActive: true
      }
    ];
  } catch (error) {
    console.error('Error fetching automation rules:', error);
    return [];
  }
};

export const createAutomationRule = async (rule: Omit<AutomationRule, 'id'>): Promise<AutomationRule | null> => {
  try {
    console.log('Creating automation rule:', rule);
    
    // Mock creation
    const newRule: AutomationRule = {
      id: `rule-${Date.now()}`,
      ...rule
    };
    
    return newRule;
  } catch (error) {
    console.error('Error creating automation rule:', error);
    return null;
  }
};

export const executeStageTransition = async (transition: StageTransition): Promise<boolean> => {
  try {
    console.log('Executing stage transition:', transition);
    
    // Update order stage in database
    const { error: orderError } = await supabase
      .from('orders')
      .update({ 
        status: transition.toStage,
        updated_at: new Date().toISOString()
      })
      .eq('id', transition.orderId);

    if (orderError) {
      console.error('Error updating order stage:', orderError);
      return false;
    }

    // Get order details for notification
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('customer_id, restaurant_id')
      .eq('id', transition.orderId)
      .single();

    if (fetchError || !order) {
      console.error('Error fetching order for notification:', fetchError);
      return true; // Stage updated but notification failed
    }

    // Send stage update notification
    try {
      await preparationNotificationService.sendStageUpdateNotification(
        transition.orderId,
        transition.toStage,
        order.customer_id
      );
    } catch (notificationError) {
      console.error('Error sending stage notification:', notificationError);
      // Don't fail the transition if notification fails
    }

    return true;
  } catch (error) {
    console.error('Error executing stage transition:', error);
    return false;
  }
};

export const scheduleAutomaticTransition = async (
  orderId: string, 
  toStage: string, 
  delayMinutes: number
): Promise<boolean> => {
  try {
    console.log(`Scheduling automatic transition for order ${orderId} to ${toStage} in ${delayMinutes} minutes`);
    
    // In a real implementation, this would use a job queue or scheduler
    setTimeout(async () => {
      const transition: StageTransition = {
        orderId,
        fromStage: 'current', // This would be fetched from the database
        toStage,
        timestamp: new Date()
      };
      
      await executeStageTransition(transition);
    }, delayMinutes * 60 * 1000);
    
    return true;
  } catch (error) {
    console.error('Error scheduling automatic transition:', error);
    return false;
  }
};

export const getStageTransitionHistory = async (orderId: string): Promise<StageTransition[]> => {
  try {
    console.log('Fetching stage transition history for order:', orderId);
    
    // Mock history for now
    return [
      {
        orderId,
        fromStage: 'order_received',
        toStage: 'preparation_started',
        timestamp: new Date()
      }
    ];
  } catch (error) {
    console.error('Error fetching stage transition history:', error);
    return [];
  }
};

export const validateStageTransition = async (
  orderId: string, 
  fromStage: string, 
  toStage: string
): Promise<{ valid: boolean; reason?: string }> => {
  try {
    // Basic validation logic
    const validTransitions = {
      'order_received': ['preparation_started', 'cancelled'],
      'preparation_started': ['cooking', 'cancelled'],
      'cooking': ['quality_check', 'cancelled'],
      'quality_check': ['packaging', 'cooking'],
      'packaging': ['ready_for_pickup'],
      'ready_for_pickup': ['picked_up'],
      'picked_up': ['delivered']
    };

    const allowedNextStages = validTransitions[fromStage as keyof typeof validTransitions] || [];
    
    if (!allowedNextStages.includes(toStage)) {
      return { 
        valid: false, 
        reason: `Invalid transition from ${fromStage} to ${toStage}` 
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('Error validating stage transition:', error);
    return { valid: false, reason: 'Validation error' };
  }
};

export const automaticTransitionService = {
  getAutomationRules,
  createAutomationRule,
  executeStageTransition,
  scheduleAutomaticTransition,
  getStageTransitionHistory,
  validateStageTransition
};
