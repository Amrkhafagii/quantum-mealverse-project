
import { supabase } from '@/integrations/supabase/client';
import { recordOrderHistory } from './webhook/orderHistoryService';

// Re-export the recordOrderHistory function from the module
export { recordOrderHistory };

// This file re-exports all webhook-related services for backward compatibility
export * from './webhook';
