import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { Users, Search, Crown, Eye, TrendingUp, TrendingDown, RefreshCw, Download, FileSpreadsheet } from 'lucide-react';
import { exportUserProfilesToCSV, exportLoyaltyTransactionsToCSV, exportCombinedReportToCSV } from '@/lib/csvExport';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  loyalty_points: number;
  loyalty_tier: string;
  created_at: string;
  updated_at: string;
}

interface LoyaltyTransaction {
  id: string;
  user_id: string;
  points: number;
  transaction_type: string;
  description: string | null;
  order_id: string | null;
  created_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userTransactions, setUserTransactions] = useState<LoyaltyTransaction[]>([]);
  const [showTransactions, setShowTransactions] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, transactionsRes] = await Promise.all([
        supabase.from('user_profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('loyalty_transactions').select('*').order('created_at', { ascending: false }).limit(100),
      ]);

      if (usersRes.data) setUsers(usersRes.data);
      if (transactionsRes.data) setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewUserTransactions = async (user: UserProfile) => {
    setSelectedUser(user);
    const { data } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('user_id', user.user_id)
      .order('created_at', { ascending: false });
    
    setUserTransactions(data || []);
    setShowTransactions(true);
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'gold':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'silver':
        return 'bg-gray-400/20 text-gray-300 border-gray-400/50';
      case 'bronze':
      default:
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredUsers = users.filter(user => 
    (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPoints = users.reduce((sum, user) => sum + user.loyalty_points, 0);
  const totalEarned = transactions
    .filter(t => t.transaction_type === 'earn')
    .reduce((sum, t) => sum + t.points, 0);
  const totalRedeemed = transactions
    .filter(t => t.transaction_type === 'redeem')
    .reduce((sum, t) => sum + Math.abs(t.points), 0);

  const statsCards = [
    {
      title: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'text-primary',
    },
    {
      title: 'Total Points Outstanding',
      value: totalPoints.toLocaleString(),
      icon: Crown,
      color: 'text-yellow-500',
    },
    {
      title: 'Points Earned (All Time)',
      value: totalEarned.toLocaleString(),
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      title: 'Points Redeemed (All Time)',
      value: totalRedeemed.toLocaleString(),
      icon: TrendingDown,
      color: 'text-accent',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif tracking-wider">Users & Loyalty</h1>
            <p className="text-muted-foreground mt-2">
              Manage user profiles and loyalty transactions
            </p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    exportUserProfilesToCSV(users);
                    toast.success('User profiles exported');
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  User Profiles
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    exportLoyaltyTransactionsToCSV(transactions);
                    toast.success('Transactions exported');
                  }}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Loyalty Transactions
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    exportCombinedReportToCSV(users, transactions);
                    toast.success('Combined report exported');
                  }}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Combined Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
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

        {/* Users Table */}
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif">User Profiles</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No users found matching your search.' : 'No users registered yet.'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.full_name || 'Not set'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email || 'Not set'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTierBadgeColor(user.loyalty_tier)}>
                          {user.loyalty_tier}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {user.loyalty_points.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewUserTransactions(user)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Transactions
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-serif">Recent Loyalty Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No loyalty transactions yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    <TableHead>Order ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 20).map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(tx.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={tx.transaction_type === 'earn' ? 'default' : 'secondary'}>
                          {tx.transaction_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{tx.description || '-'}</TableCell>
                      <TableCell className={`text-right font-mono ${tx.points >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {tx.points >= 0 ? '+' : ''}{tx.points}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {tx.order_id || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Transactions Dialog */}
      <Dialog open={showTransactions} onOpenChange={setShowTransactions}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif">
              Transactions for {selectedUser?.full_name || selectedUser?.email || 'User'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-4 text-sm">
              <div className="bg-muted px-3 py-2 rounded">
                <span className="text-muted-foreground">Tier:</span>{' '}
                <Badge className={getTierBadgeColor(selectedUser?.loyalty_tier || 'Bronze')}>
                  {selectedUser?.loyalty_tier}
                </Badge>
              </div>
              <div className="bg-muted px-3 py-2 rounded">
                <span className="text-muted-foreground">Current Points:</span>{' '}
                <span className="font-mono font-bold">{selectedUser?.loyalty_points.toLocaleString()}</span>
              </div>
            </div>
            
            {userTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found for this user.
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-muted-foreground">
                          {formatDateTime(tx.created_at)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={tx.transaction_type === 'earn' ? 'default' : 'secondary'}>
                            {tx.transaction_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{tx.description || '-'}</TableCell>
                        <TableCell className={`text-right font-mono ${tx.points >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {tx.points >= 0 ? '+' : ''}{tx.points}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;
