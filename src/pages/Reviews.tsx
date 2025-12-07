import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageSquare, Award, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Reviews = () => {
  return (
    <PageLayout
      title="Leave A Review"
      subtitle="Share your experience and help others discover Luna Luxury Hair"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Star className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Your Voice Matters</CardTitle>
            <CardDescription className="text-base">
              We value your feedback and would love to hear about your experience with our products and services.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Review Platforms */}
        <div>
          <h2 className="text-2xl font-serif text-center mb-6">Where to Leave Your Review</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Google Reviews</CardTitle>
                <CardDescription>
                  Share your experience on Google to help others find us
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline" disabled>
                  Write Google Review
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Product Reviews</CardTitle>
                <CardDescription>
                  Leave a review on specific products you've purchased
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/shop">Browse Products</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Why Review */}
        <div>
          <h2 className="text-2xl font-serif text-center mb-6">Why Your Review Helps</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Help Others</CardTitle>
                <CardDescription>
                  Your honest feedback helps other customers make informed decisions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Earn Rewards</CardTitle>
                <CardDescription>
                  Get bonus loyalty points for every verified review you submit
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Shape Our Future</CardTitle>
                <CardDescription>
                  Your insights help us improve our products and services
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Review Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Review Guidelines</CardTitle>
            <CardDescription>
              To ensure quality reviews, please keep these tips in mind:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Be honest and detailed about your experience</li>
              <li>• Include information about the product quality, fit, and durability</li>
              <li>• Share how you styled or used the product</li>
              <li>• Add photos if possible to help others visualize the product</li>
              <li>• Keep it respectful and constructive</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact Alternative */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-serif mb-3">Have Private Feedback?</h3>
            <p className="text-muted-foreground mb-6">
              If you'd like to share feedback privately or have any concerns, please don't hesitate to contact us directly.
            </p>
            <Button asChild variant="outline">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Reviews;
