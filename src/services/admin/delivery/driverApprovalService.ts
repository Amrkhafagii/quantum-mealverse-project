import { supabase } from '@/integrations/supabase/client';
import type { DriverApprovalWorkflow } from '@/types/admin';

const STATUS_ENUMS = ['pending', 'reviewing', 'approved', 'rejected', 'suspended'] as const;
const STAGE_ENUMS = ['documents', 'background_check', 'vehicle_inspection', 'final_approval'] as const;

function safeStatus(status: any): DriverApprovalWorkflow['status'] {
  return STATUS_ENUMS.includes(status) ? status : 'pending';
}
function safeStage(stage: any): DriverApprovalWorkflow['stage'] {
  return STAGE_ENUMS.includes(stage) ? stage : 'documents';
}

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

      // Map DB result to typed objects
      return (data || []).map((row: any) => ({
        id: row.id,
        delivery_user_id: row.delivery_user_id,
        status: safeStatus(row.status),
        stage: safeStage(row.stage),
        reviewer_id: row.reviewer_id,
        review_notes: row.review_notes,
        rejection_reason: row.rejection_reason,
        approval_date: row.approval_date,
        rejection_date: row.rejection_date,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
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

      // Ensure correct enums in return
      return {
        id: data.id,
        delivery_user_id: data.delivery_user_id,
        status: safeStatus(data.status),
        stage: safeStage(data.stage),
        reviewer_id: data.reviewer_id,
        review_notes: data.review_notes,
        rejection_reason: data.rejection_reason,
        approval_date: data.approval_date,
        rejection_date: data.rejection_date,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error creating driver approval:', error);
      return null;
    }
  }
}

export const driverApprovalService = new DriverApprovalService();
