import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Percent, Tag, Sparkles, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const SpecialOffers = () => {
  return (
    <PageLayout
      title="Special Offers"
      subtitle="Exclusive deals and promotions for our valued customers"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Current Offers */}
        <div className="space-y-4">
          <h2 className="text-2xl font-serif text-center mb-6">Current Promotions</h2>
          
          <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <Percent className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">First Order Discount</CardTitle>
                  <CardDescription className="text-base">
                    Get 10% OFF your first order using discount code <span className="font-semibold text-primary">"LUNANEW10"</span> during checkout
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                <Button asChild>
                  <Link to="/shop">Shop Now</Link>
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span>Code: LUNANEW10</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">Loyalty Rewards</CardTitle>
                  <CardDescription className="text-base">
                    Join our Luna Loyalty Program to earn points on every purchase and unlock exclusive perks
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link to="/loyalty">Learn More</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Offers */}
        <div className="space-y-4">
          <h2 className="text-2xl font-serif text-center mb-6">Upcoming Deals</h2>
          
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">Seasonal Collections</CardTitle>
                  <CardDescription>
                    Stay tuned for exclusive discounts on our seasonal collections throughout the year
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                  <Tag className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">Bundle Deals</CardTitle>
                  <CardDescription>
                    Watch this space for special bundle offers and combo deals on popular products
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Newsletter CTA */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <h3 className="text-2xl font-serif mb-3">Never Miss a Deal</h3>
            <p className="text-muted-foreground mb-6">
              Subscribe to our newsletter to receive exclusive offers and be the first to know about new promotions
            </p>
            <Button asChild size="lg">
              <Link to="/#newsletter">Subscribe Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default SpecialOffers;
