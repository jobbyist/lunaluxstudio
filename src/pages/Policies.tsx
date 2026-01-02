import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Truck, RotateCcw, FileText } from "lucide-react";
import { LegalDialog, TermsContent, PrivacyContent, RefundsContent, ShippingContent } from "@/components/LegalDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Policies = () => {
  return (
    <PageLayout
      title="Store Policies"
      subtitle="Everything you need to know about our terms, privacy, shipping, and refund policies"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Quick Access Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Terms of Service</CardTitle>
              <CardDescription>
                Our terms and conditions for using Luna Luxury Hair services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LegalDialog title="Terms of Service" content={<TermsContent />}>
                Read Terms
              </LegalDialog>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Privacy Policy</CardTitle>
              <CardDescription>
                How we collect, use, and protect your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LegalDialog title="Privacy Policy" content={<PrivacyContent />}>
                Read Privacy Policy
              </LegalDialog>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors" id="shipping">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Shipping Policy</CardTitle>
              <CardDescription>
                Updated shipping information including international shipping options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LegalDialog title="Shipping Information" content={<ShippingContent />}>
                Read Shipping Policy
              </LegalDialog>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <RotateCcw className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Refund Policy</CardTitle>
              <CardDescription>
                Our return and refund policy for customer satisfaction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LegalDialog title="Refund Policy" content={<RefundsContent />}>
                Read Refund Policy
              </LegalDialog>
            </CardContent>
          </Card>
        </div>

        {/* Policy Highlights */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Policy Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="shipping" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="shipping">Shipping</TabsTrigger>
                <TabsTrigger value="returns">Returns</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
                <TabsTrigger value="terms">Terms</TabsTrigger>
              </TabsList>
              
              <TabsContent value="shipping" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Updated Shipping Information</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Shipping fees have been slightly increased to maintain quality service</li>
                    <li>• We now offer international shipping to select countries</li>
                    <li>• Free shipping on orders above R1500 (South Africa only)</li>
                    <li>• Standard delivery: 3-5 business days (SA)</li>
                    <li>• International delivery: 5-12 business days (via UPS, DHL and FedEx coming soon)</li>
                    <li>• Shipping rates calculated at checkout</li>
                    <li>• Customers are responsible for any duties or levies at customs</li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="returns" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Returns & Refunds</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• 30-day return window for unused products</li>
                    <li>• Products must be in original packaging</li>
                    <li>• Custom orders are non-refundable</li>
                    <li>• Refunds processed within 7-10 business days</li>
                    <li>• Contact us first to initiate a return</li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="privacy" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Your Privacy Matters</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• We protect your personal information</li>
                    <li>• Data encrypted with industry-standard security</li>
                    <li>• Never share your information with third parties</li>
                    <li>• You can request data deletion at any time</li>
                    <li>• POPIA compliant practices</li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="terms" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Terms of Service</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• By purchasing, you agree to our terms</li>
                    <li>• Products are for personal use only</li>
                    <li>• Pricing subject to change without notice</li>
                    <li>• We reserve the right to cancel fraudulent orders</li>
                    <li>• Loyalty points are non-transferable</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-serif mb-3">Questions About Our Policies?</h3>
            <p className="text-muted-foreground mb-4">
              If you have any questions or need clarification on any of our policies, please don't hesitate to reach out.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Policies;
