import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Gift, Star, TrendingUp, Crown, Calculator, Sparkles, Check, Users, Zap, ShoppingBag, Truck, HeadphonesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

// Tier configurations
const TIERS = {
  Bronze: {
    name: "Bronze",
    min: 0,
    max: 499,
    color: "from-amber-600 to-amber-800",
    bgColor: "bg-amber-100 dark:bg-amber-950",
    textColor: "text-amber-800 dark:text-amber-200",
    borderColor: "border-amber-300 dark:border-amber-700",
    icon: Award,
    multiplier: 1,
    benefits: ["1 point per R10 spent", "Birthday double points", "10 bonus points per review", "100 points per referral"]
  },
  Silver: {
    name: "Silver",
    min: 500,
    max: 1499,
    color: "from-gray-400 to-gray-600",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    textColor: "text-gray-800 dark:text-gray-200",
    borderColor: "border-gray-300 dark:border-gray-600",
    icon: Star,
    multiplier: 1.5,
    benefits: ["1.5x points on all purchases", "Birthday double points", "15 bonus points per review", "150 points per referral", "Early access to sales", "Free shipping on orders over R1000"]
  },
  Gold: {
    name: "Gold",
    min: 1500,
    max: Infinity,
    color: "from-yellow-400 to-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
    textColor: "text-yellow-800 dark:text-yellow-200",
    borderColor: "border-yellow-300 dark:border-yellow-600",
    icon: Crown,
    multiplier: 2,
    benefits: ["2x points on all purchases", "Birthday triple points", "25 bonus points per review", "200 points per referral", "Priority early access", "Free shipping on all orders", "Exclusive VIP sales", "Priority customer support", "Free gift with every order"]
  }
};
const REDEMPTION_OPTIONS = [{
  points: 500,
  value: 50,
  label: "R50 off"
}, {
  points: 1000,
  value: 120,
  label: "R120 off + Free Shipping"
}, {
  points: 2000,
  value: 300,
  label: "R300 off + Exclusive Gift"
}, {
  points: 3000,
  value: 500,
  label: "R500 off + VIP Treatment"
}];
const Loyalty = () => {
  const [spendAmount, setSpendAmount] = useState("");
  const [currentPoints, setCurrentPoints] = useState("");
  const [selectedTier, setSelectedTier] = useState<keyof typeof TIERS>("Bronze");

  // Calculate points from spend
  const calculatedPoints = spendAmount ? Math.floor((parseFloat(spendAmount) || 0) / 10) * TIERS[selectedTier].multiplier : 0;

  // Calculate what you can redeem with current points
  const pointsValue = currentPoints ? parseInt(currentPoints) || 0 : 0;
  const availableRedemptions = REDEMPTION_OPTIONS.filter(opt => opt.points <= pointsValue);
  const bestRedemption = availableRedemptions[availableRedemptions.length - 1];

  // Calculate progress to next tier
  const getTierProgress = (points: number) => {
    if (points >= 1500) return {
      current: "Gold",
      next: null,
      progress: 100
    };
    if (points >= 500) return {
      current: "Silver",
      next: "Gold",
      progress: (points - 500) / 1000 * 100
    };
    return {
      current: "Bronze",
      next: "Silver",
      progress: points / 500 * 100
    };
  };
  const tierProgress = getTierProgress(pointsValue);
  return <PageLayout title="The Lux Club" subtitle="Your exclusive gateway to premium rewards, VIP benefits, and unforgettable luxury experiences">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/90 to-primary p-8 md:p-12 text-white">
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-10" />
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="h-10 w-10" />
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                Exclusive Membership
              </Badge>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Unlock Luxury Rewards
            </h2>
            <p className="text-white/90 text-lg mb-6">
              Join The Lux Club and transform every purchase into points, exclusive perks, and VIP experiences. 
              The more you shop, the more you're rewarded.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                <Link to="/auth">Join Now - It's Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link to="/profile">View My Points</Link>
              </Button>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 opacity-20">
            <Sparkles className="h-64 w-64" />
          </div>
        </div>

        {/* How It Works */}
        <div className="text-center space-y-8">
          <div>
            <h3 className="text-2xl md:text-3xl font-serif mb-2">How It Works</h3>
            <p className="text-muted-foreground">Earning rewards has never been easier</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[{
            icon: ShoppingBag,
            title: "Shop",
            desc: "Make a purchase on any product"
          }, {
            icon: Star,
            title: "Earn",
            desc: "Get 1 point for every R10 spent"
          }, {
            icon: TrendingUp,
            title: "Level Up",
            desc: "Unlock higher tiers & multipliers"
          }, {
            icon: Gift,
            title: "Redeem",
            desc: "Convert points to rewards"
          }].map((step, i) => <div key={i} className="relative">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">{step.title}</h4>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
                {i < 3 && <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />}
              </div>)}
          </div>
        </div>

        {/* Tier Cards */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-serif mb-2">VIP Tiers</h3>
            <p className="text-muted-foreground">Progress through tiers to unlock exclusive benefits</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(TIERS).map(([key, tier]) => {
            const TierIcon = tier.icon;
            const isCurrentTier = tierProgress.current === key;
            return <Card key={key} className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${isCurrentTier ? 'ring-2 ring-primary' : ''}`}>
                  {isCurrentTier && <Badge className="absolute top-4 right-4 bg-primary">Your Tier</Badge>}
                  <div className={`h-2 bg-gradient-to-r ${tier.color}`} />
                  <CardHeader className="text-center pb-2">
                    <div className={`mx-auto w-16 h-16 rounded-full ${tier.bgColor} flex items-center justify-center mb-3`}>
                      <TierIcon className={`h-8 w-8 ${tier.textColor}`} />
                    </div>
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    <CardDescription>
                      {tier.max === Infinity ? `${tier.min}+ points` : `${tier.min} - ${tier.max} points`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <span className="text-3xl font-bold text-primary">{tier.multiplier}x</span>
                      <span className="text-sm text-muted-foreground ml-1">points multiplier</span>
                    </div>
                    <ul className="space-y-2">
                      {tier.benefits.map((benefit, i) => <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>)}
                    </ul>
                  </CardContent>
                </Card>;
          })}
          </div>
        </div>

        {/* Points Calculator */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Points Calculator</CardTitle>
                <CardDescription>See how much you can earn and redeem</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="earn" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="earn">Calculate Earnings</TabsTrigger>
                <TabsTrigger value="redeem">Check Redemptions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="earn" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="tier">Your Current Tier</Label>
                      <div className="flex gap-2 mt-2">
                        {Object.keys(TIERS).map(tier => <Button key={tier} variant={selectedTier === tier ? "default" : "outline"} size="sm" onClick={() => setSelectedTier(tier as keyof typeof TIERS)}>
                            {tier}
                          </Button>)}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="spend">Purchase Amount (R)</Label>
                      <Input id="spend" type="number" placeholder="Enter amount" value={spendAmount} onChange={e => setSpendAmount(e.target.value)} className="mt-2" />
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-center items-center bg-background rounded-lg p-6 border">
                    <p className="text-sm text-muted-foreground mb-2">You'll Earn</p>
                    <p className="text-5xl font-bold text-primary">{calculatedPoints.toFixed(0)}</p>
                    <p className="text-muted-foreground">points</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      ({TIERS[selectedTier].multiplier}x {selectedTier} multiplier applied)
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="redeem" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="points">Your Current Points</Label>
                      <Input id="points" type="number" placeholder="Enter your points" value={currentPoints} onChange={e => setCurrentPoints(e.target.value)} className="mt-2" />
                    </div>
                    
                    {pointsValue > 0 && tierProgress.next && <div className="p-4 bg-background rounded-lg border">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress to {tierProgress.next}</span>
                          <span className="font-medium">{Math.round(tierProgress.progress)}%</span>
                        </div>
                        <Progress value={tierProgress.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                          {tierProgress.next === "Silver" ? `${500 - pointsValue} points to Silver` : `${1500 - pointsValue} points to Gold`}
                        </p>
                      </div>}
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Available Redemptions:</p>
                    {REDEMPTION_OPTIONS.map(option => {
                    const isAvailable = option.points <= pointsValue;
                    return <div key={option.points} className={`flex items-center justify-between p-3 rounded-lg border ${isAvailable ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-muted/50 opacity-60'}`}>
                          <div className="flex items-center gap-2">
                            {isAvailable ? <Check className="h-4 w-4 text-green-600" /> : <div className="h-4 w-4" />}
                            <span className="font-medium">{option.label}</span>
                          </div>
                          <Badge variant={isAvailable ? "default" : "secondary"}>
                            {option.points} pts
                          </Badge>
                        </div>;
                  })}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Ways to Earn */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-serif mb-2">More Ways to Earn</h3>
            <p className="text-muted-foreground">Beyond shopping, there are many ways to grow your points</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-pink-100 dark:bg-pink-950 flex items-center justify-center mb-3">
                  <Star className="h-6 w-6 text-pink-600" />
                </div>
                <CardTitle>Rate Products</CardTitle>
                <CardDescription>Share your thoughts and earn</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary mb-1">+10-25 pts</p>
                <p className="text-sm text-muted-foreground">Per review (varies by tier)</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Refer Friends</CardTitle>
                <CardDescription>Share the love and get rewarded</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary mb-1">+100-200 pts</p>
                <p className="text-sm text-muted-foreground">Per successful referral</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center mb-3">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Birthday Bonus</CardTitle>
                <CardDescription>Celebrate with extra points</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary mb-1">2x-3x pts</p>
                <p className="text-sm text-muted-foreground">On all birthday purchases</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gold Benefits Highlight */}
        <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center flex-shrink-0">
                <Crown className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-serif mb-2 text-primary-foreground">Reach Gold Status</h3>
                <p className="text-muted-foreground mb-4">
                  Our most exclusive tier unlocks the ultimate luxury experience. Enjoy 2x points, 
                  free shipping on every order, priority support, and exclusive VIP-only sales.
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                    <Truck className="h-3 w-3 mr-1" /> Free Shipping
                  </Badge>
                  <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                    <HeadphonesIcon className="h-3 w-3 mr-1" /> Priority Support
                  </Badge>
                  <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                    <Gift className="h-3 w-3 mr-1" /> Free Gifts
                  </Badge>
                </div>
              </div>
              <Button asChild size="lg" className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700">
                <Link to="/auth">Start Earning Now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-primary text-white border-0">
          <CardContent className="py-12 text-center">
            <h3 className="text-3xl font-serif mb-4">Ready to Join The Lux Club?</h3>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Sign up today and start earning points on every purchase. 
              It's free to join and you'll unlock exclusive benefits immediately.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild size="lg" variant="secondary">
                <Link to="/auth">Create Free Account</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link to="/explore">Start Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>;
};
export default Loyalty;