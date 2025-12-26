import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export interface AdminUser {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
}

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminStatus();
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAdmin(false);
        setAdminUser(null);
        setLoading(false);
        return;
      }

      // Check if user has admin role using the has_role function
      const { data: hasAdminRole, error } = await supabase
        .rpc('has_role', { _user_id: user.id, _role: 'admin' });
      
      if (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
        setAdminUser(null);
      } else if (hasAdminRole) {
        setIsAdmin(true);
        setAdminUser({
          id: user.id,
          user_id: user.id,
          role: 'admin',
          created_at: new Date().toISOString(),
        });
      } else {
        setIsAdmin(false);
        setAdminUser(null);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
      setAdminUser(null);
    } finally {
      setLoading(false);
    }
  };

  const requireAdmin = (redirectTo: string = '/admin-login') => {
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