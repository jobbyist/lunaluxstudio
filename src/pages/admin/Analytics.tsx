import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, TrendingUp, Users, Eye } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

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
  const [dateRange, setDateRange] = useState(30); // days

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      // Get total events
      const { count: totalEvents } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString());

      // Get page views
      const { count: pageViews } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view')
        .gte('created_at', startDate.toISOString());

      // Get unique users (sessions)
      const { data: sessionsData } = await supabase
        .from('analytics_events')
        .select('session_id')
        .gte('created_at', startDate.toISOString());

      const uniqueSessions = new Set(sessionsData?.map(s => s.session_id) || []);

      // Get top pages
      const { data: pagesData } = await supabase
        .from('analytics_events')
        .select('page_url')
        .eq('event_type', 'page_view')
        .gte('created_at', startDate.toISOString());

      const pageCounts = pagesData?.reduce((acc: any, item) => {
        const url = item.page_url || 'unknown';
        acc[url] = (acc[url] || 0) + 1;
        return acc;
      }, {});

      const topPages = Object.entries(pageCounts || {})
        .map(([page, count]) => ({ page, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Get events by day
      const { data: eventsData } = await supabase
        .from('analytics_events')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      const eventsByDay = eventsData?.reduce((acc: any, event) => {
        const date = new Date(event.created_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.entries(eventsByDay || {}).map(([date, count]) => ({
        date,
        count: count as number,
      }));

      setAnalytics({
        totalEvents: totalEvents || 0,
        uniqueUsers: uniqueSessions.size,
        pageViews: pageViews || 0,
        topPages,
        eventsByDay: chartData,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

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
      title: 'Unique Visitors',
      value: analytics.uniqueUsers,
      icon: Users,
      color: 'text-purple-500',
    },
    {
      title: 'Avg. Per Day',
      value: Math.round(analytics.totalEvents / dateRange),
      icon: TrendingUp,
      color: 'text-orange-500',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Track your website performance
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setDateRange(7)}
              className={`px-4 py-2 rounded-lg ${
                dateRange === 7 ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              7 days
            </button>
            <button
              onClick={() => setDateRange(30)}
              className={`px-4 py-2 rounded-lg ${
                dateRange === 30 ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              30 days
            </button>
            <button
              onClick={() => setDateRange(90)}
              className={`px-4 py-2 rounded-lg ${
                dateRange === 90 ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              90 days
            </button>
          </div>
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

            {/* Events Chart */}
            {analytics.eventsByDay.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Events Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.eventsByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#8884d8"
                        name="Events"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Top Pages */}
            {analytics.topPages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Top Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.topPages.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="page" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#82ca9d" name="Page Views" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {analytics.totalEvents === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No analytics data available for the selected period.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
