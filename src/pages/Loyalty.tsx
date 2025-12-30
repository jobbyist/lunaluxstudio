import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Gift, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Loyalty = () => {
  return (
    <PageLayout
      title="Luna Loyalty Program"
      subtitle="Earn points and unlock exclusive members-only perks and cash-back rewards"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <Card className="border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Join the Luna Loyalty Program</CardTitle>
            <CardDescription>
              Become a VIP member and enjoy exclusive benefits every time you shop
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Earn Points</CardTitle>
              <CardDescription>
                Earn 1 point for every R10 spent on qualifying purchases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Double points on your birthday</li>
                <li>• Bonus points for product reviews</li>
                <li>• Extra points for referrals</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Redeem Rewards</CardTitle>
              <CardDescription>
                Convert your points into amazing rewards and discounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 500 points = R50 off your next order</li>
                <li>• 1000 points = R120 off + free shipping</li>
                <li>• 2000 points = R300 off + exclusive gift</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">VIP Tiers</CardTitle>
              <CardDescription>
                Unlock higher tiers for even better perks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Bronze: 0-499 points</li>
                <li>• Silver: 500-1499 points</li>
                <li>• Gold: 1500+ points</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Exclusive Perks</CardTitle>
              <CardDescription>
                Members-only benefits and special access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Early access to new collections</li>
                <li>• Exclusive sales and promotions</li>
                <li>• Priority customer support</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <h3 className="text-2xl font-serif mb-3">Ready to Start Earning?</h3>
            <p className="text-muted-foreground mb-6">
              Create an account or sign in to join the Luna Loyalty Program today
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild size="lg">
                <Link to="/auth">Sign Up Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Loyalty;
