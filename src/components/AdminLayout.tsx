import { ReactNode, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Home,
  Package,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  Scissors,
  ShoppingBag,
  UserCheck,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

const adminNavItems = [
  { path: '/manage', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/manage/products', label: 'Products', icon: Package },
  { path: '/manage/custom-wigs', label: 'Custom Wig Orders', icon: Scissors },
  { path: '/manage/users', label: 'Users & Loyalty', icon: Users },
  { path: '/manage/referrals', label: 'Referrals', icon: Users },
  { path: '/manage/navigation', label: 'Navigation', icon: Menu },
  { path: '/manage/homepage', label: 'Homepage Editor', icon: Home },
  { path: '/manage/ai-site', label: 'AI Site Manager', icon: Sparkles },
  { path: '/manage/ai-tools', label: 'AI Content Tools', icon: Sparkles },
  { path: '/manage/articles', label: 'Content Manager', icon: Home },
  { path: '/manage/publish', label: 'Publish Content', icon: Home },
  { path: '/manage/analytics', label: 'Analytics', icon: LayoutDashboard },
  { path: '/manage/activity', label: 'Activity Logs', icon: Users },
  { path: '/manage/admins', label: 'Admin Access', icon: Users },
  { path: '/manage/settings', label: 'Settings', icon: Settings },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { isAdmin, loading, adminUser } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast.error('You must be an admin to access this page');
      navigate('/manage-login');
    }
  }, [isAdmin, loading, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300 lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <Link to="/manage" className="text-xl font-serif tracking-wider text-foreground">
              Luna Lux Admin
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-border">
            <div className="mb-3 px-4 py-2 bg-muted rounded-lg">
              <p className="text-sm font-medium capitalize text-foreground">Role: {adminUser?.role}</p>
            </div>
            <Button
              variant="outline"
              className="w-full border-border hover:bg-primary hover:text-primary-foreground transition-all"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                View Site →
              </Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
