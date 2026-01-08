import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Package, TrendingUp, ExternalLink, AlertCircle, PenTool, Activity, Sparkles, Users, Newspaper, Layout } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  publishedContent: number;
  recentEvents: number;
  newsletterSubscribers: number;
  homepageSections: number;
}

interface RecentActivity {
  id: string;
  action_type: string;
  created_at: string;
  success: boolean;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    publishedContent: 0,
    recentEvents: 0,
    newsletterSubscribers: 0,
    homepageSections: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [contentRes, eventsRes, newsletterRes, sectionsRes, activityRes] = await Promise.all([
        supabase.from('published_content').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('admin_activity_logs').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('newsletter_subscriptions').select('id', { count: 'exact', head: true }),
        supabase.from('homepage_sections').select('id', { count: 'exact', head: true }),
        supabase.from('admin_activity_logs').select('id, action_type, created_at, success').order('created_at', { ascending: false }).limit(5),
      ]);

      setStats({
        publishedContent: contentRes.count || 0,
        recentEvents: eventsRes.count || 0,
        newsletterSubscribers: newsletterRes.count || 0,
        homepageSections: sectionsRes.count || 0,
      });

      setRecentActivity(activityRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatActionType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statsCards = [
    {
      title: 'Published Content',
      value: loading ? '...' : stats.publishedContent,
      icon: FileText,
      color: 'text-primary',
    },
    {
      title: 'Newsletter Subscribers',
      value: loading ? '...' : stats.newsletterSubscribers,
      icon: Users,
      color: 'text-accent',
    },
    {
      title: 'Events (30 days)',
      value: loading ? '...' : stats.recentEvents,
      icon: TrendingUp,
      color: 'text-primary',
    },
    {
      title: 'Homepage Sections',
      value: loading ? '...' : stats.homepageSections,
      icon: Layout,
      color: 'text-accent',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif tracking-wider">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome to the Luna Lux Hair admin dashboard
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-serif">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Shopify Notice */}
        <Card className="border-accent/50 bg-accent/5">
          <CardContent className="flex items-start gap-4 pt-6">
            <AlertCircle className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-serif text-foreground">Product Management</h3>
              <p className="text-muted-foreground mt-1">
                Please log in to your Shopify dashboard to make any product related changes. 
                We're working on integrating it into your website dashboard soon!
              </p>
              <a 
                href="https://admin.shopify.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:text-accent transition-colors mt-2 text-sm"
              >
                Open Shopify Dashboard
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-serif">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${activity.success ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm text-foreground">{formatActionType(activity.action_type)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(activity.created_at)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No recent activity. Start by publishing content to the Featured Stories section.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-serif">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              <Link
                to="/manage/publish"
                className="flex items-center justify-center p-6 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
              >
                <div className="text-center">
                  <PenTool className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium text-foreground">Publish Content</p>
                </div>
              </Link>
              <Link
                to="/manage/homepage"
                className="flex items-center justify-center p-6 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
              >
                <div className="text-center">
                  <Layout className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium text-foreground">Edit Homepage</p>
                </div>
              </Link>
              <Link
                to="/manage/navigation"
                className="flex items-center justify-center p-6 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
              >
                <div className="text-center">
                  <Newspaper className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium text-foreground">Navigation</p>
                </div>
              </Link>
              <Link
                to="/manage/ai-site"
                className="flex items-center justify-center p-6 border-2 border-dashed border-border rounded-lg hover:border-accent hover:bg-accent/5 transition-all bg-gradient-to-br from-primary/10 to-accent/10"
              >
                <div className="text-center">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-accent animate-pulse" />
                  <p className="font-medium text-foreground">AI Site Manager</p>
                  <p className="text-xs text-muted-foreground mt-1">Make changes with AI</p>
                </div>
              </Link>
              <Link
                to="/manage/activity"
                className="flex items-center justify-center p-6 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
              >
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium text-foreground">View Activity Logs</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;