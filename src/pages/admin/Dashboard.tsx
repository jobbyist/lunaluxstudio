import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Package, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const statsCards = [
    {
      title: 'Total Articles',
      value: 0,
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      title: 'Products (Shopify)',
      value: 'Managed via Shopify',
      icon: Package,
      color: 'text-green-500',
    },
    {
      title: 'Events (30 days)',
      value: 0,
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
            Welcome to the Luna Luxury Hair admin dashboard
          </p>
        </div>

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
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              No recent activity. Database tables will be configured as needed.
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Link
                to="/admin/articles/new"
                className="flex items-center justify-center p-6 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors"
              >
                <div className="text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">New Article</p>
                </div>
              </Link>
              <Link
                to="/admin/products"
                className="flex items-center justify-center p-6 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors"
              >
                <div className="text-center">
                  <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">Manage Products</p>
                </div>
              </Link>
              <Link
                to="/admin/analytics"
                className="flex items-center justify-center p-6 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors"
              >
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">View Analytics</p>
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
