
import { supabase } from '@/integrations/supabase/client';
import type { DriverApprovalWorkflow } from '@/types/admin';

export class DriverApprovalService {
  async getDriverApprovals(status?: string): Promise<DriverApprovalWorkflow[]> {
    try {
      let query = supabase
        .from('driver_approval_workflow')
        .select(`
          *,
          delivery_users (
            first_name,
            last_name,
            phone,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching driver approvals:', error);
      return [];
    }
  }

  async updateDriverApproval(
    id: string, 
    updates: Partial<DriverApprovalWorkflow>, 
    reviewerId: string
  ): Promise<boolean> {
    try {
      const updateData = {
        ...updates,
        reviewer_id: reviewerId,
        updated_at: new Date().toISOString()
      };

      if (updates.status === 'approved') {
        updateData.approval_date = new Date().toISOString();
      } else if (updates.status === 'rejected') {
        updateData.rejection_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('driver_approval_workflow')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Update delivery user status if approved
      if (updates.status === 'approved') {
        const { data: workflow } = await supabase
          .from('driver_approval_workflow')
          .select('delivery_user_id')
          .eq('id', id)
          .single();

        if (workflow) {
          await supabase
            .from('delivery_users')
            .update({ 
              is_approved: true,
              verification_status: 'verified',
              status: 'active'
            })
            .eq('id', workflow.delivery_user_id);
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating driver approval:', error);
      return false;
    }
  }

  async createDriverApproval(deliveryUserId: string): Promise<DriverApprovalWorkflow | null> {
    try {
      const { data, error } = await supabase
        .from('driver_approval_workflow')
        .insert({
          delivery_user_id: deliveryUserId,
          status: 'pending',
          stage: 'documents'
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating driver approval:', error);
      return null;
    }
  }
}

export const driverApprovalService = new DriverApprovalService();

