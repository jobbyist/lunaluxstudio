import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PointsRedemptionProps {
  cartTotal: number;
  onDiscountApplied: (discount: number, pointsUsed: number) => void;
  onDiscountRemoved: () => void;
  appliedDiscount: number;
}

interface RedemptionTier {
  points: number;
  discount: number;
  label: string;
}

const REDEMPTION_TIERS: RedemptionTier[] = [
  { points: 500, discount: 50, label: "R50 off" },
  { points: 1000, discount: 120, label: "R120 off" },
  { points: 2000, discount: 300, label: "R300 off" },
];

export const PointsRedemption = ({
  cartTotal,
  onDiscountApplied,
  onDiscountRemoved,
  appliedDiscount,
}: PointsRedemptionProps) => {
  const [userPoints, setUserPoints] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<RedemptionTier | null>(null);

  useEffect(() => {
    checkAuthAndLoadPoints();
  }, []);

  const checkAuthAndLoadPoints = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setIsAuthenticated(true);
      
      // Get user's loyalty points
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("loyalty_points")
        .eq("user_id", user.id)
        .single();
      
      if (profile) {
        setUserPoints(profile.loyalty_points);
      }
    }
    
    setLoading(false);
  };

  const handleRedeemPoints = async (tier: RedemptionTier) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to redeem points");
      return;
    }

    if (userPoints < tier.points) {
      toast.error("Not enough points for this reward");
      return;
    }

    // Create a negative transaction to deduct points
    const { error } = await supabase
      .from("loyalty_transactions")
      .insert({
        user_id: user.id,
        points: -tier.points,
        transaction_type: "redemption",
        description: `Redeemed ${tier.points} points for ${tier.label} discount`,
      });

    if (error) {
      console.error("Redemption error:", error);
      toast.error("Failed to redeem points");
      return;
    }

    setSelectedTier(tier);
    setUserPoints(userPoints - tier.points);
    onDiscountApplied(tier.discount, tier.points);
    toast.success(`Applied ${tier.label} discount!`);
  };

  const handleRemoveDiscount = async () => {
    if (!selectedTier) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Refund the points
    const { error } = await supabase
      .from("loyalty_transactions")
      .insert({
        user_id: user.id,
        points: selectedTier.points,
        transaction_type: "bonus",
        description: `Refunded ${selectedTier.points} points (discount removed)`,
      });

    if (!error) {
      setUserPoints(userPoints + selectedTier.points);
    }

    setSelectedTier(null);
    onDiscountRemoved();
    toast.success("Discount removed");
  };

  if (loading || !isAuthenticated || userPoints === 0) {
    return null;
  }

  const availableTiers = REDEMPTION_TIERS.filter(tier => tier.points <= userPoints);

  if (appliedDiscount > 0 && selectedTier) {
    return (
      <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  {selectedTier.label} Applied
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {selectedTier.points} points redeemed
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveDiscount}
              className="text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="h-5 w-5 text-primary" />
          <span className="font-medium">The Lux Club Points</span>
          <Badge variant="secondary" className="ml-auto">
            {userPoints} pts
          </Badge>
        </div>
        
        {availableTiers.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-2">Redeem your points:</p>
            <div className="flex flex-wrap gap-2">
              {availableTiers.map((tier) => (
                <Button
                  key={tier.points}
                  variant="outline"
                  size="sm"
                  onClick={() => handleRedeemPoints(tier)}
                  className="flex-1 min-w-[100px]"
                >
                  {tier.label}
                  <span className="text-xs text-muted-foreground ml-1">
                    ({tier.points} pts)
                  </span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Earn {500 - userPoints} more points to unlock your first reward!
          </p>
        )}
      </CardContent>
    </Card>
  );
};
