import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export interface AdminUser {
  id: string;
  user_id: string;
  role: 'admin' | 'editor' | 'viewer';
  created_at: string;
  updated_at: string;
}

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // For now, check if user exists - admin_users table will be created later
      // Temporarily allow authenticated users as admins for development
      setIsAdmin(true);
      setAdminUser({
        id: user.id,
        user_id: user.id,
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const requireAdmin = (redirectTo: string = '/auth') => {
    if (!loading && !isAdmin) {
      navigate(redirectTo);
    }
  };

  return {
    isAdmin,
    adminUser,
    loading,
    checkAdminStatus,
    requireAdmin,
  };
};
