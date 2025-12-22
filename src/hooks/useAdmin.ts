import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

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
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    checkAdminStatus();
  }, [isAuthenticated, user]);

  const checkAdminStatus = () => {
    try {
      if (!isAuthenticated || !user) {
        setIsAdmin(false);
        setAdminUser(null);
        setLoading(false);
        return;
      }

      // Create a compatible admin user object
      const adminData: AdminUser = {
        id: '1',
        user_id: user.username,
        role: user.role as 'admin' | 'editor' | 'viewer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setIsAdmin(true);
      setAdminUser(adminData);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const requireAdmin = (redirectTo: string = '/admin/signin') => {
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
