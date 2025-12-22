import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { analyticsAPI } from '@/lib/githubStorage';
import { BarChart3, TrendingUp, Users, Eye } from 'lucide-react';

interface AnalyticsData {
  totalEvents: number;
  uniqueUsers: number;
  pageViews: number;
  topPages: Array<{ page: string; count: number }>;
  eventsByDay: Array<{ date: string; count: number }>;
}

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalEvents: 0,
    uniqueUsers: 0,
    pageViews: 0,
    topPages: [],
    eventsByDay: [],
  });
  const [loading, setLoading] = useState(true);
  const [dateRange] = useState(30); // days

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      // Get total events
      const totalEvents = await analyticsAPI.count(startDate.toISOString());

      setAnalytics({
        totalEvents,
        uniqueUsers: 0,
        pageViews: 0,
        topPages: [],
        eventsByDay: [],
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const statsCards = [
    {
      title: 'Total Events',
      value: analytics.totalEvents,
      icon: BarChart3,
      color: 'text-blue-500',
    },
    {
      title: 'Page Views',
      value: analytics.pageViews,
      icon: Eye,
      color: 'text-green-500',
    },
    {
      title: 'Unique Users',
      value: analytics.uniqueUsers,
      icon: Users,
      color: 'text-purple-500',
    },
    {
      title: 'Avg. Session',
      value: '0m',
      icon: TrendingUp,
      color: 'text-orange-500',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Track your website performance and user engagement
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

            {/* Message about analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Analytics Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Analytics tracking is now file-based. Event data will be stored in the CMS content file.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
