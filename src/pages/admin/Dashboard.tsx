import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Package, TrendingUp, ExternalLink, AlertCircle, PenTool, Activity, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const statsCards = [
    {
      title: 'Published Content',
      value: 0,
      icon: FileText,
      color: 'text-primary',
    },
    {
      title: 'Products (Shopify)',
      value: 'Managed via Shopify',
      icon: Package,
      color: 'text-accent',
    },
    {
      title: 'Events (30 days)',
      value: 0,
      icon: TrendingUp,
      color: 'text-primary',
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <p className="text-muted-foreground text-center py-8">
              No recent activity. Start by publishing content to the Featured Stories section.
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-serif">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
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
                to="/manage/products"
                className="flex items-center justify-center p-6 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
              >
                <div className="text-center">
                  <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium text-foreground">Manage Products</p>
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
