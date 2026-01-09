import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Heart, Star, Award, Crown, LogOut, User, Gift } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  loyalty_points: number;
  loyalty_tier: string;
}

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
}

interface RatingItem {
  id: string;
  product_id: string;
  rating: number;
  created_at: string;
}

const TIER_THRESHOLDS = {
  Bronze: { min: 0, max: 499, next: 'Silver', pointsToNext: 500 },
  Silver: { min: 500, max: 1499, next: 'Gold', pointsToNext: 1500 },
  Gold: { min: 1500, max: Infinity, next: null, pointsToNext: null },
};

const getTierIcon = (tier: string) => {
  switch (tier) {
    case 'Gold':
      return <Crown className="h-6 w-6 text-yellow-500" />;
    case 'Silver':
      return <Award className="h-6 w-6 text-gray-400" />;
    default:
      return <Award className="h-6 w-6 text-amber-700" />;
  }
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'Gold':
      return 'from-yellow-400 to-yellow-600';
    case 'Silver':
      return 'from-gray-300 to-gray-500';
    default:
      return 'from-amber-600 to-amber-800';
  }
};

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        // If no profile exists, create one
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: insertError } = await supabase
            .from('user_profiles')
            .insert({ 
              user_id: user.id, 
              full_name: user.user_metadata?.full_name || null 
            })
            .select()
            .single();
          if (insertError) throw insertError;
          return newProfile as UserProfile;
        }
        throw error;
      }
      return data as UserProfile;
    },
    enabled: !!user?.id,
  });

  // Fetch wishlist
  const { data: wishlist = [], isLoading: wishlistLoading } = useQuery({
    queryKey: ['user-wishlist', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WishlistItem[];
    },
    enabled: !!user?.id,
  });

  // Fetch ratings
  const { data: ratings = [], isLoading: ratingsLoading } = useQuery({
    queryKey: ['user-ratings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('product_ratings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as RatingItem[];
    },
    enabled: !!user?.id,
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
    navigate("/");
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentTier = profile?.loyalty_tier || 'Bronze';
  const currentPoints = profile?.loyalty_points || 0;
  const tierInfo = TIER_THRESHOLDS[currentTier as keyof typeof TIER_THRESHOLDS];
  const progressToNext = tierInfo.pointsToNext 
    ? ((currentPoints - tierInfo.min) / (tierInfo.pointsToNext - tierInfo.min)) * 100 
    : 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 md:pt-40 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-serif">{profile?.full_name || user?.email}</h1>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {/* Loyalty Points Card */}
          <Card className="mb-8 overflow-hidden">
            <div className={`bg-gradient-to-r ${getTierColor(currentTier)} p-6 text-white`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getTierIcon(currentTier)}
                  <div>
                    <p className="text-sm opacity-90">The Lux Club</p>
                    <h2 className="text-2xl font-serif">{currentTier} Member</h2>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{currentPoints}</p>
                  <p className="text-sm opacity-90">Points</p>
                </div>
              </div>
              
              {tierInfo.next && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>{tierInfo.min} pts</span>
                    <span>{tierInfo.pointsToNext} pts to {tierInfo.next}</span>
                  </div>
                  <Progress value={progressToNext} className="h-2 bg-white/30" />
                </div>
              )}
            </div>
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Gift className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">500 pts = R50 off</p>
                </div>
                <div>
                  <Gift className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">1000 pts = R120 off</p>
                </div>
                <div>
                  <Gift className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">2000 pts = R300 off</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for Wishlist and Ratings */}
          <Tabs defaultValue="wishlist" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="wishlist" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Wishlist ({wishlist.length})
              </TabsTrigger>
              <TabsTrigger value="ratings" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                My Ratings ({ratings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wishlist">
              <Card>
                <CardHeader>
                  <CardTitle>My Wishlist</CardTitle>
                  <CardDescription>Products you've saved for later</CardDescription>
                </CardHeader>
                <CardContent>
                  {wishlistLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : wishlist.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Your wishlist is empty</p>
                      <p className="text-sm mt-2">Browse products and click the heart icon to save them here</p>
                      <Button className="mt-4" onClick={() => navigate('/explore')}>
                        Explore Products
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {wishlist.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">Product</p>
                            <p className="text-xs text-muted-foreground">
                              Added {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => navigate(`/product/${item.product_id.split('/').pop()}`)}>
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ratings">
              <Card>
                <CardHeader>
                  <CardTitle>My Ratings</CardTitle>
                  <CardDescription>Products you've rated</CardDescription>
                </CardHeader>
                <CardContent>
                  {ratingsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : ratings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>You haven't rated any products yet</p>
                      <p className="text-sm mt-2">Rate products to help other shoppers</p>
                      <Button className="mt-4" onClick={() => navigate('/explore')}>
                        Explore Products
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {ratings.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < item.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Rated {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => navigate(`/product/${item.product_id.split('/').pop()}`)}>
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;