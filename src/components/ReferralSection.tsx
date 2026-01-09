import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Users, Gift, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const REFERRAL_BONUS_POINTS = 100; // Points awarded for successful referrals

export const ReferralSection = () => {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Get or create referral code
    const { data: codeData } = await supabase
      .from("referral_codes" as any)
      .select("code, uses")
      .eq("user_id", user.id)
      .single();

    if (codeData) {
      setReferralCode((codeData as any).code);
      setReferralCount((codeData as any).uses);
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

    // Get referral count
    const { data: referrals } = await supabase
      .from("referrals" as any)
      .select("id")
      .eq("referrer_id", user.id);
    
    if (referrals) {
      setReferralCount((referrals as any[]).length);
    }

    setLoading(false);
  };

  const generateReferralCode = (userId: string): string => {
    const prefix = "LUNA";
    const suffix = userId.substring(0, 6).toUpperCase();
    return `${prefix}${suffix}`;
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

  const totalPointsEarned = referralCount * REFERRAL_BONUS_POINTS;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Refer Friends</CardTitle>
        </div>
        <CardDescription>
          Share your referral link and earn {REFERRAL_BONUS_POINTS} points for each friend who signs up!
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

        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Your Referrals</p>
              <p className="text-sm text-muted-foreground">
                {referralCount} friend{referralCount !== 1 ? 's' : ''} joined
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg">
            +{totalPointsEarned} pts
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Points are automatically awarded when your referred friends complete their first purchase.
        </p>
      </CardContent>
    </Card>
  );
};
