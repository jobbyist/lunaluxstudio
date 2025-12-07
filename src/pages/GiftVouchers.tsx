import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";

const GiftVouchers = () => {
  const { formatPrice } = useCurrency();
  
  const voucherAmounts = [500, 1000, 2000, 5000];

  return (
    <PageLayout
      title="Gift Vouchers"
      subtitle="Give the gift of luxury with Luna Hair gift vouchers"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Gift className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">The Perfect Gift</CardTitle>
            <CardDescription className="text-base">
              Surprise your loved ones with a Luna Luxury Hair gift voucher. Let them choose their perfect hair and beauty products.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Voucher Options */}
        <div>
          <h2 className="text-2xl font-serif text-center mb-6">Choose Your Amount</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {voucherAmounts.map((amount) => (
              <Card key={amount} className="text-center hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-3xl font-cursive text-primary">
                    {formatPrice(amount)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" disabled>
                    Select
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Gift className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Digital Delivery</CardTitle>
              <CardDescription>
                Receive your gift voucher instantly via email
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">No Expiry</CardTitle>
              <CardDescription>
                Our gift vouchers never expire - use them whenever you're ready
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Personalized</CardTitle>
              <CardDescription>
                Add a personal message to make it extra special
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Coming Soon Notice */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-serif mb-3">Coming Soon</h3>
            <p className="text-muted-foreground mb-6">
              Our gift voucher system is currently being set up. Please contact us directly to purchase gift vouchers in the meantime.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/shop">Browse Products</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default GiftVouchers;
