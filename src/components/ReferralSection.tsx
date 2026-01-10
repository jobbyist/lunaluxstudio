import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Users, Gift, Check, Clock, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Points awarded for successful referrals (after first purchase)
const REFERRAL_BONUS_POINTS = {
  Bronze: 100,
  Silver: 150,
  Gold: 200
};

interface Referral {
  id: string;
  referred_user_id: string;
  first_purchase_completed: boolean;
  points_awarded: boolean;
  created_at: string;
}

export const ReferralSection = () => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [userTier, setUserTier] = useState<string>("Bronze");

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Get user profile for tier
    const { data: profileData } = await supabase
      .from("user_profiles")
      .select("loyalty_tier")
      .eq("user_id", user.id)
      .single();
    
    if (profileData) {
      setUserTier(profileData.loyalty_tier || "Bronze");
    }

    // Get or create referral code
    const { data: codeData } = await supabase
      .from("referral_codes" as any)
      .select("code, uses")
      .eq("user_id", user.id)
      .single();

    if (codeData) {
      setReferralCode((codeData as any).code);
    } else {
      // Generate a new referral code
      const newCode = generateReferralCode(user.id);
      const { error } = await supabase
        .from("referral_codes" as any)
        .insert({ user_id: user.id, code: newCode });
      
      if (!error) {
        setReferralCode(newCode);
      }
    }

    // Get referrals with status
    const { data: referralData } = await supabase
      .from("referrals" as any)
      .select("*")
      .eq("referrer_id", user.id)
      .order("created_at", { ascending: false });
    
    if (referralData && Array.isArray(referralData)) {
      setReferrals(referralData as unknown as Referral[]);
    }

    setLoading(false);
  };

  const generateReferralCode = (userId: string): string => {
    const prefix = "LUX";
    const suffix = userId.substring(0, 6).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}${suffix}${random}`;
  };

  const copyToClipboard = async () => {
    if (!referralCode) return;
    
    const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return null;
  }

  if (!referralCode) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Sign in to get your referral code</p>
        </CardContent>
      </Card>
    );
  }

  const completedReferrals = referrals.filter(r => r.first_purchase_completed);
  const pendingReferrals = referrals.filter(r => !r.first_purchase_completed);
  const bonusPoints = REFERRAL_BONUS_POINTS[userTier as keyof typeof REFERRAL_BONUS_POINTS] || 100;
  const totalPointsEarned = completedReferrals.length * bonusPoints;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Refer Friends to The Lux Club</CardTitle>
        </div>
        <CardDescription>
          Share your referral link and earn <strong>{bonusPoints} points</strong> when your friends make their first purchase!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={`${window.location.origin}/auth?ref=${referralCode}`}
            readOnly
            className="text-sm"
          />
          <Button onClick={copyToClipboard} variant="outline">
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Completed</p>
                <p className="text-xs text-muted-foreground">
                  {completedReferrals.length} referral{completedReferrals.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-200 text-green-800">
              +{totalPointsEarned} pts
            </Badge>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">Pending</p>
                <p className="text-xs text-muted-foreground">
                  {pendingReferrals.length} awaiting purchase
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-start gap-3">
            <Gift className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm">How it works</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                <li>1. Share your unique referral link with friends</li>
                <li>2. They sign up using your link</li>
                <li>3. When they complete their first purchase, you earn {bonusPoints} points!</li>
              </ul>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Points are automatically awarded when your referred friends complete their first purchase.
          <br />
          <span className="text-primary">Gold members earn 200 pts, Silver 150 pts, Bronze 100 pts per referral.</span>
        </p>
      </CardContent>
    </Card>
  );
};