import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Truck, RotateCcw, FileText } from "lucide-react";
import { LegalDialog, TermsContent, PrivacyContent, RefundsContent, ShippingContent } from "@/components/LegalDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
const Policies = () => {
  return <PageLayout title="Store Policies" subtitle="Everything you need to know about our terms, privacy, shipping, and refund policies">
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
    </PageLayout>;
};
export default Policies;