import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

type ActionType = 
  | 'login_attempt'
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'password_reset'
  | 'content_created'
  | 'content_updated'
  | 'content_deleted'
  | 'settings_updated'
  | 'admin_action';

interface LogActivityParams {
  actionType: ActionType;
  actionDetails?: Record<string, unknown>;
  success?: boolean;
}

export const useActivityLogger = () => {
  const logActivity = async ({ actionType, actionDetails = {}, success = true }: LogActivityParams) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('admin_activity_logs').insert([{
        user_id: user?.id || null,
        action_type: actionType,
        action_details: actionDetails as Json,
        user_agent: navigator.userAgent,
        success,
      }]);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  return { logActivity };
};

// Standalone function for use outside of React components
export const logAdminActivity = async ({ actionType, actionDetails = {}, success = true }: LogActivityParams) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('admin_activity_logs').insert([{
      user_id: user?.id || null,
      action_type: actionType,
      action_details: actionDetails as Json,
      user_agent: navigator.userAgent,
      success,
    }]);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
