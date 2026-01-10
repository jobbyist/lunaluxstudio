import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Users, Search, UserPlus, Gift, CheckCircle, Clock, RefreshCw, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  uses: number;
  created_at: string;
  user_profile?: {
    full_name: string | null;
    email: string | null;
  };
}

interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  referral_code: string;
  first_purchase_completed: boolean;
  first_purchase_at: string | null;
  points_awarded: boolean;
  created_at: string;
  referrer_profile?: {
    full_name: string | null;
    email: string | null;
  };
  referred_profile?: {
    full_name: string | null;
    email: string | null;
  };
}

const AdminReferrals = () => {
  const [referralCodes, setReferralCodes] = useState<ReferralCode[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch referral codes
      const { data: codesData, error: codesError } = await supabase
        .from('referral_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (codesError) throw codesError;

      // Fetch all referrals
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('*')
        .order('created_at', { ascending: false });

      if (referralsError) throw referralsError;

      // Fetch user profiles for referral codes
      if (codesData && codesData.length > 0) {
        const userIds = codesData.map(c => c.user_id);
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        const codesWithProfiles = codesData.map(code => ({
          ...code,
          user_profile: profileMap.get(code.user_id) || null,
        }));
        setReferralCodes(codesWithProfiles);
      } else {
        setReferralCodes([]);
      }

      // Fetch user profiles for referrals
      if (referralsData && referralsData.length > 0) {
        const allUserIds = [...new Set([
          ...referralsData.map(r => r.referrer_id),
          ...referralsData.map(r => r.referred_user_id),
        ])];
        
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, full_name, email')
          .in('user_id', allUserIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        const referralsWithProfiles = referralsData.map(referral => ({
          ...referral,
          referrer_profile: profileMap.get(referral.referrer_id) || null,
          referred_profile: profileMap.get(referral.referred_user_id) || null,
        }));
        setReferrals(referralsWithProfiles);
      } else {
        setReferrals([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
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

  const filteredCodes = referralCodes.filter(code =>
    code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.user_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.user_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReferrals = referrals.filter(ref =>
    ref.referral_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.referrer_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.referrer_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.referred_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.referred_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalReferrals = referrals.length;
  const completedReferrals = referrals.filter(r => r.first_purchase_completed).length;
  const pendingReferrals = referrals.filter(r => !r.first_purchase_completed).length;
  const pointsAwarded = referrals.filter(r => r.points_awarded).length;

  const statsCards = [
    {
      title: 'Total Referral Codes',
      value: referralCodes.length,
      icon: Gift,
      color: 'text-primary',
    },
    {
      title: 'Total Referrals',
      value: totalReferrals,
      icon: UserPlus,
      color: 'text-accent',
    },
    {
      title: 'Completed Referrals',
      value: completedReferrals,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      title: 'Pending Referrals',
      value: pendingReferrals,
      icon: Clock,
      color: 'text-yellow-500',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif tracking-wider">Referrals</h1>
            <p className="text-muted-foreground mt-2">
              Manage referral codes and track referral status
            </p>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm">
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

        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search codes, users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs defaultValue="referrals" className="w-full">
          <TabsList>
            <TabsTrigger value="referrals" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Referrals ({totalReferrals})
            </TabsTrigger>
            <TabsTrigger value="codes" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Referral Codes ({referralCodes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="referrals">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-serif">All Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading referrals...</div>
                ) : filteredReferrals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No referrals found matching your search.' : 'No referrals yet.'}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Referrer</TableHead>
                        <TableHead>Referred User</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Points Awarded</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>First Purchase</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReferrals.map((referral) => (
                        <TableRow key={referral.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{referral.referrer_profile?.full_name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{referral.referrer_profile?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{referral.referred_profile?.full_name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{referral.referred_profile?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="bg-muted px-2 py-1 rounded text-xs">{referral.referral_code}</code>
                          </TableCell>
                          <TableCell>
                            {referral.first_purchase_completed ? (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {referral.points_awarded ? (
                              <Badge className="bg-primary/20 text-primary border-primary/50">
                                <Gift className="h-3 w-3 mr-1" />
                                Awarded
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(referral.created_at)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {referral.first_purchase_at ? formatDateTime(referral.first_purchase_at) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="codes">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="font-serif">Referral Codes</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading codes...</div>
                ) : filteredCodes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No codes found matching your search.' : 'No referral codes created yet.'}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead className="text-right">Uses</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCodes.map((code) => (
                        <TableRow key={code.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{code.user_profile?.full_name || 'Unknown'}</p>
                              <p className="text-xs text-muted-foreground">{code.user_profile?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{code.code}</code>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {code.uses}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(code.created_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminReferrals;