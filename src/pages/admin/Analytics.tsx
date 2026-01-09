import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  ShoppingCart,
  MousePointerClick,
  ExternalLink,
  Info,
  RefreshCw,
  Calendar,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface ActivityLog {
  id: string;
  action_type: string;
  created_at: string;
  success: boolean | null;
  action_details: unknown;
}

interface DailyStats {
  date: string;
  events: number;
}

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [gaMeasurementId, setGaMeasurementId] = useState('');
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    todayEvents: 0,
    weekEvents: 0,
    uniqueActionTypes: 0,
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [allLogsRes, todayLogsRes, weekLogsRes] = await Promise.all([
        supabase
          .from('admin_activity_logs')
          .select('*')
          .gte('created_at', monthAgo.toISOString())
          .order('created_at', { ascending: false }),
        supabase
          .from('admin_activity_logs')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', today.toISOString()),
        supabase
          .from('admin_activity_logs')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', weekAgo.toISOString()),
      ]);

      const logs = allLogsRes.data || [];
      setActivityLogs(logs);

      // Calculate unique action types
      const uniqueTypes = new Set(logs.map(log => log.action_type));

      // Calculate daily stats for the chart
      const dailyMap = new Map<string, number>();
      logs.forEach(log => {
        const date = new Date(log.created_at).toLocaleDateString('en-ZA', {
          month: 'short',
          day: 'numeric',
        });
        dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
      });

      const dailyData = Array.from(dailyMap.entries())
        .map(([date, events]) => ({ date, events }))
        .reverse()
        .slice(-14); // Last 14 days

      setDailyStats(dailyData);

      setStats({
        totalEvents: logs.length,
        todayEvents: todayLogsRes.count || 0,
        weekEvents: weekLogsRes.count || 0,
        uniqueActionTypes: uniqueTypes.size,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group events by action type for the bar chart
  const eventsByType = activityLogs.reduce((acc, log) => {
    const type = log.action_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const eventTypeData = Object.entries(eventsByType)
    .map(([name, count]) => ({ name: formatActionType(name), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  function formatActionType(type: string) {
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statsCards = [
    {
      title: 'Total Events (30 days)',
      value: stats.totalEvents,
      icon: BarChart3,
      color: 'text-primary',
    },
    {
      title: 'Today\'s Events',
      value: stats.todayEvents,
      icon: Calendar,
      color: 'text-green-500',
    },
    {
      title: 'This Week',
      value: stats.weekEvents,
      icon: TrendingUp,
      color: 'text-accent',
    },
    {
      title: 'Unique Event Types',
      value: stats.uniqueActionTypes,
      icon: Activity,
      color: 'text-yellow-500',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif tracking-wider">Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Track your website performance and user behavior
            </p>
          </div>
          <Button onClick={fetchAnalyticsData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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
                  <div className="text-2xl font-serif">
                    {loading ? '...' : stat.value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Event Logs</TabsTrigger>
            <TabsTrigger value="setup">Google Analytics Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Activity Chart */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-serif">Activity Over Time</CardTitle>
                <CardDescription>Admin activity events in the last 14 days</CardDescription>
              </CardHeader>
              <CardContent>
                {dailyStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyStats}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-muted-foreground" fontSize={12} />
                      <YAxis className="text-muted-foreground" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="events" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No activity data available yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Events by Type */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-serif">Events by Type</CardTitle>
                <CardDescription>Top 10 most common event types</CardDescription>
              </CardHeader>
              <CardContent>
                {eventTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={eventTypeData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" className="text-muted-foreground" fontSize={12} />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={150} 
                        className="text-muted-foreground" 
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No event data available yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-serif">Recent Activity Logs</CardTitle>
                <CardDescription>Last 50 admin activity events</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : activityLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No activity logs yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Event Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activityLogs.slice(0, 50).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-muted-foreground">
                            {formatDateTime(log.created_at)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatActionType(log.action_type)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={log.success ? 'default' : 'destructive'}>
                              {log.success ? 'Success' : 'Failed'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                            {log.action_details ? JSON.stringify(log.action_details) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="setup">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Google Analytics Setup */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Google Analytics 4
                  </CardTitle>
                  <CardDescription>
                    Connect Google Analytics to track website traffic, user behavior, and conversions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ga-id">Measurement ID</Label>
                    <Input
                      id="ga-id"
                      placeholder="G-XXXXXXXXXX"
                      value={gaMeasurementId}
                      onChange={(e) => setGaMeasurementId(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Find your Measurement ID in Google Analytics → Admin → Data Streams
                    </p>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-accent mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium">How to set up Google Analytics:</p>
                        <ol className="list-decimal list-inside mt-2 space-y-1 text-muted-foreground">
                          <li>Go to <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">analytics.google.com</a></li>
                          <li>Create or select a property</li>
                          <li>Set up a Web data stream</li>
                          <li>Copy the Measurement ID (G-XXXXXXXXXX)</li>
                          <li>Add it to your website's index.html</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" disabled>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Google Analytics Dashboard
                  </Button>
                </CardContent>
              </Card>

              {/* Tracking Events */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="font-serif flex items-center gap-2">
                    <MousePointerClick className="h-5 w-5" />
                    E-commerce Tracking
                  </CardTitle>
                  <CardDescription>
                    Track key conversion events automatically
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <span>Page Views</span>
                      </div>
                      <Badge variant="outline">Ready</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        <span>Add to Cart</span>
                      </div>
                      <Badge variant="outline">Ready</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span>Purchases</span>
                      </div>
                      <Badge variant="outline">Ready</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Sign Ups</span>
                      </div>
                      <Badge variant="outline">Ready</Badge>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-4">
                    These events are pre-configured and will automatically send data to Google Analytics once connected.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
