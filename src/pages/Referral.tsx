import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Gift, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Referral = () => {
  return (
    <PageLayout
      title="Referral Program"
      subtitle="Share the love and earn rewards for every friend you refer"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Refer Friends, Earn Rewards</CardTitle>
            <CardDescription className="text-base">
              Share Luna Luxury Hair with your friends and family. When they make their first purchase, you both get rewarded!
            </CardDescription>
          </CardHeader>
        </Card>

        {/* How It Works */}
        <div>
          <h2 className="text-2xl font-serif text-center mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <CardTitle className="text-lg">Share Your Link</CardTitle>
                <CardDescription>
                  Get your unique referral link from your account dashboard
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <CardTitle className="text-lg">Friend Shops</CardTitle>
                <CardDescription>
                  Your friend uses your link to make their first purchase
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <CardTitle className="text-lg">You Both Win</CardTitle>
                <CardDescription>
                  You get rewards and your friend gets a discount on their order
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Rewards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Your Reward</CardTitle>
              <CardDescription className="text-base">
                For every successful referral, you earn:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span>R100 store credit</span>
                </li>
                <li className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span>100 loyalty points</span>
                </li>
                <li className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span>Exclusive perks for top referrers</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Their Reward</CardTitle>
              <CardDescription className="text-base">
                Your friend gets:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span>10% off their first order</span>
                </li>
                <li className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span>Welcome bonus points</span>
                </li>
                <li className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span>Access to exclusive offers</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <h3 className="text-2xl font-serif mb-3">Start Referring Today</h3>
            <p className="text-muted-foreground mb-6">
              Sign in to your account to get your unique referral link and start earning rewards
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild size="lg">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/loyalty">Learn About Loyalty</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Referral;
