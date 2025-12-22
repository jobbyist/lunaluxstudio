import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Package, Users, TrendingUp } from 'lucide-react';

interface DashboardStats {
  articlesCount: number;
  productsCount: number;
  analyticsCount: number;
  recentActivity: any[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    articlesCount: 0,
    productsCount: 0,
    analyticsCount: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      // Load articles count
      const { count: articlesCount } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });

      // Load products count
      const { count: productsCount } = await supabase
        .from('cms_products')
        .select('*', { count: 'exact', head: true });

      // Load analytics count (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: analyticsCount } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Load recent articles
      const { data: recentArticles } = await supabase
        .from('articles')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(5);

      setStats({
        articlesCount: articlesCount || 0,
        productsCount: productsCount || 0,
        analyticsCount: analyticsCount || 0,
        recentActivity: recentArticles || [],
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Articles',
      value: stats.articlesCount,
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      title: 'Total Products',
      value: stats.productsCount,
      icon: Package,
      color: 'text-green-500',
    },
    {
      title: 'Events (30 days)',
      value: stats.analyticsCount,
      icon: TrendingUp,
      color: 'text-purple-500',
    },
    {
      title: 'Active Users',
      value: 0,
      icon: Users,
      color: 'text-orange-500',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome to the LunaStudio admin dashboard
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {statsCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {stat.title}
                      </CardTitle>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Articles</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentActivity.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No articles yet. Create your first article!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {stats.recentActivity.map((article) => (
                      <div
                        key={article.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium">{article.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {article.status} • Updated{' '}
                            {new Date(article.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <a
                    href="/admin/articles/new"
                    className="flex items-center justify-center p-6 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="font-medium">New Article</p>
                    </div>
                  </a>
                  <a
                    href="/admin/products/new"
                    className="flex items-center justify-center p-6 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="text-center">
                      <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="font-medium">New Product</p>
                    </div>
                  </a>
                  <a
                    href="/admin/analytics"
                    className="flex items-center justify-center p-6 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="font-medium">View Analytics</p>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
